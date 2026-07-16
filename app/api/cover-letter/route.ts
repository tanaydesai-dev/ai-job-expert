import { ApiError } from "@google/genai";
import { NextResponse } from "next/server";

import { gemini } from "@/lib/gemini/client";
import { coverLetterRequestSchema } from "@/lib/cover-letter/schema";

const SYSTEM_PROMPT =
  "You write concise, compelling cover letters tailored to a specific job " +
  "posting. Use only the candidate's stated background — do not invent " +
  "experience, skills, or credentials they didn't mention. Address the " +
  "letter to 'Dear Hiring Manager' unless a specific name is given. Keep it " +
  "to 3-4 paragraphs. Output only the letter body, starting with the " +
  "salutation — no letterhead, date, address block, or commentary.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsedInput = coverLetterRequestSchema.safeParse(body);
  if (!parsedInput.success) {
    return NextResponse.json(
      { error: parsedInput.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { jobDescription, name, background, tone } = parsedInput.data;

  const input =
    `Job description:\n${jobDescription}\n\n` +
    `Candidate name: ${name}\n` +
    `Candidate background: ${background}\n` +
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
