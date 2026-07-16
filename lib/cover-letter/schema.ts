import { z } from "zod";

import { jobDescriptionFormSchema } from "@/lib/job-analysis/schema";

export const COVER_LETTER_TONES = [
  "professional",
  "enthusiastic",
  "formal",
  "conversational",
] as const;

export const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const coverLetterFormSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(200, "That name is too long."),
  resume: z
    .instanceof(File, { message: "Upload your resume as a PDF." })
    .refine(
      (file) => file.type === "application/pdf",
      "Resume must be a PDF file.",
    )
    .refine(
      (file) => file.size <= MAX_RESUME_FILE_SIZE_BYTES,
      "Resume must be under 5MB.",
    ),
  tone: z.enum(COVER_LETTER_TONES),
});

export type CoverLetterFormValues = z.infer<typeof coverLetterFormSchema>;

// Server-side: text fields arrive alongside the resume file via FormData, so
// they're validated separately from the extracted resume text (see route.ts).
export const coverLetterRequestFieldsSchema = z.object({
  name: coverLetterFormSchema.shape.name,
  tone: coverLetterFormSchema.shape.tone,
  jobDescription: jobDescriptionFormSchema.shape.jobDescription,
});

export const resumeTextSchema = z
  .string()
  .trim()
  .min(
    30,
    "Couldn't find enough text in that PDF — make sure it isn't a scanned image.",
  )
  .max(
    20000,
    "That resume is too long to process — please upload a shorter version.",
  );
