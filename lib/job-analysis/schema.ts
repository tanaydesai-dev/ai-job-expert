import { z } from "zod";

export const jobDescriptionFormSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .min(50, "Paste the full job description (at least 50 characters).")
    .max(20000, "That's too long — please paste under 20,000 characters."),
});

export type JobDescriptionFormValues = z.infer<typeof jobDescriptionFormSchema>;

export const jobAnalysisSchema = z.object({
  title: z
    .string()
    .nullable()
    .describe("The job title, e.g. 'Senior Software Engineer'. Null if not stated."),
  company: z
    .string()
    .nullable()
    .describe("The hiring company's name. Null if not stated."),
  location: z
    .string()
    .nullable()
    .describe("The job location as stated, e.g. 'San Francisco, CA'. Null if not stated."),
  workMode: z
    .enum(["remote", "hybrid", "onsite", "unspecified"])
    .describe("The work arrangement, inferred from the posting."),
  experienceRequired: z
    .string()
    .nullable()
    .describe("Required years/level of experience as stated, e.g. '5+ years'. Null if not stated."),
  requiredSkills: z
    .array(z.string())
    .describe("Required skills and qualifications listed in the posting."),
  niceToHaves: z
    .array(z.string())
    .describe("Preferred/nice-to-have qualifications. Empty array if none are mentioned."),
  salaryRange: z
    .string()
    .nullable()
    .describe("Salary range as stated, e.g. '$160,000 - $200,000'. Null if not mentioned."),
  responsibilitiesSummary: z
    .string()
    .describe("A concise 2-4 sentence summary of the key responsibilities."),
});

export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;
