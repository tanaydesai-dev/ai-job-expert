import { ApiError } from "@google/genai";
import { NextResponse } from "next/server";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { ZodError } from "zod";

import { gemini } from "@/lib/gemini/client";
import {
  coverLetterRequestFieldsSchema,
  MAX_RESUME_FILE_SIZE_BYTES,
  resumeTextSchema,
} from "@/lib/cover-letter/schema";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const SYSTEM_PROMPT =
  "You write concise, compelling cover letters tailored to a specific job " +
  "posting. Use only the candidate's stated background — do not invent " +
  "experience, skills, or credentials they didn't mention. Address the " +
  "letter to 'Dear Hiring Manager' unless a specific name is given. Keep it " +
  "to 3-4 paragraphs. Output only the letter body, starting with the " +
  "salutation — no letterhead, date, address block, or commentary.";

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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form submission." },
      { status: 400 },
    );
  }

  const parsedFields = coverLetterRequestFieldsSchema.safeParse({
    name: formData.get("name"),
    tone: formData.get("tone"),
    jobDescription: formData.get("jobDescription"),
  });
  if (!parsedFields.success) {
    return NextResponse.json(
      { error: parsedFields.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const resumeFile = formData.get("resume");
  if (!(resumeFile instanceof File)) {
    return NextResponse.json(
      { error: "Upload your resume as a PDF." },
      { status: 400 },
    );
  }
  if (resumeFile.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Resume must be a PDF file." },
      { status: 400 },
    );
  }
  if (resumeFile.size > MAX_RESUME_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Resume must be under 5MB." },
      { status: 400 },
    );
  }

  let resumeText: string;
  try {
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    const parsedPdf = await pdfParse(resumeBuffer);
    resumeText = resumeTextSchema.parse(parsedPdf.text);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid resume." },
        { status: 400 },
      );
    }

    console.error("Error parsing resume PDF:", error);
    return NextResponse.json(
      { error: "Could not read that PDF. Please try a different file." },
      { status: 400 },
    );
  }

  const { jobDescription, name, tone } = parsedFields.data;

  const input =
    `Job description:\n${jobDescription}\n\n` +
    `Candidate name: ${name}\n` +
    `Candidate resume:\n${resumeText}\n\n` +
    `Desired tone: ${tone}\n\n` +
    "Write a cover letter for this candidate applying to this job.";

  async function startStream() {
    return gemini.interactions.create({
      model: "gemini-flash-lite-latest",
      system_instruction: SYSTEM_PROMPT,
      input,
      generation_config: {
        thinking_level: "low",
        max_output_tokens: 2048,
      },
      stream: true,
    });
  }

  let geminiStream: Awaited<ReturnType<typeof startStream>>;
  try {
    geminiStream = await startStream();
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

      console.error("Gemini API error during cover letter generation:", error);
      return NextResponse.json(
        { error: "Could not generate a cover letter. Please try again." },
        { status: 502 },
      );
    }

    console.error("Unexpected error starting cover letter generation:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of geminiStream) {
          if (event.event_type === "step.delta" && event.delta.type === "text") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (error) {
        console.error("Error while streaming cover letter:", error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
