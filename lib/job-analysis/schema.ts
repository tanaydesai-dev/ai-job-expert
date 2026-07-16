import { z } from "zod";

export const jobDescriptionFormSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .min(50, "Paste the full job description (at least 50 characters).")
    .max(20000, "That's too long — please paste under 20,000 characters."),
});

export type JobDescriptionFormValues = z.infer<typeof jobDescriptionFormSchema>;
