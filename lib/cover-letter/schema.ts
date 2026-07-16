import { z } from "zod";

import { jobDescriptionFormSchema } from "@/lib/job-analysis/schema";

export const COVER_LETTER_TONES = [
  "professional",
  "enthusiastic",
  "formal",
  "conversational",
] as const;

export const coverLetterFormSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(200, "That name is too long."),
  background: z
    .string()
    .trim()
    .min(30, "Add a bit more about your background (at least 30 characters).")
    .max(5000, "That's too long — please keep it under 5,000 characters."),
  tone: z.enum(COVER_LETTER_TONES),
});

export type CoverLetterFormValues = z.infer<typeof coverLetterFormSchema>;

export const coverLetterRequestSchema = coverLetterFormSchema.extend({
  jobDescription: jobDescriptionFormSchema.shape.jobDescription,
});

export type CoverLetterRequestValues = z.infer<typeof coverLetterRequestSchema>;
