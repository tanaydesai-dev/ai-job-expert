import { ApiError } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { gemini, withTimeout } from "@/lib/gemini/client";
import {
  jobAnalysisSchema,
  jobDescriptionFormSchema,
} from "@/lib/job-analysis/schema";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const SYSTEM_PROMPT =
  "You extract structured information from job descriptions. Only use " +
  "information explicitly stated in the posting — use null (or an empty " +
  "array, where applicable) for anything not mentioned. Do not guess or " +
  "infer values that aren't present in the text.";

const jobAnalysisJsonSchema = z.toJSONSchema(jobAnalysisSchema);

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(getClientIp(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsedInput = jobDescriptionFormSchema.safeParse(body);
  if (!parsedInput.success) {
    return NextResponse.json(
      { error: parsedInput.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { jobDescription } = parsedInput.data;

  try {
    const interaction = await withTimeout(
      gemini.interactions.create({
        model: "gemini-flash-lite-latest",
        system_instruction: SYSTEM_PROMPT,
        input: `Extract the requested details from this job description:\n\n${jobDescription}`,
        generation_config: {
          thinking_level: "low",
          max_output_tokens: 4096,
        },
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: jobAnalysisJsonSchema,
        },
      }),
      25000,
    );

    if (!interaction.output_text) {
      return NextResponse.json(
        { error: "Could not analyze this job description. Please try again." },
        { status: 502 },
      );
    }

    const parsedOutput = jobAnalysisSchema.safeParse(
      JSON.parse(interaction.output_text),
    );

    if (!parsedOutput.success) {
      console.error(
        "Gemini structured output failed validation:",
        parsedOutput.error,
      );
      return NextResponse.json(
        { error: "Could not analyze this job description. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json(parsedOutput.data);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Too many requests right now. Please try again shortly." },
          { status: 429 },
        );
      }

      if (error.status === 401 || error.status === 403) {
        console.error("Gemini authentication error:", error);
        return NextResponse.json(
          { error: "Server is misconfigured. Please contact the site owner." },
          { status: 500 },
        );
      }

      console.error("Gemini API error during job analysis:", error);
      return NextResponse.json(
        { error: "Analysis failed. Please try again." },
        { status: 502 },
      );
    }

    console.error("Unexpected error during job analysis:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
