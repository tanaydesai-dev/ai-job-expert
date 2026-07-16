"use client";

import { useState } from "react";

import { JobAnalysisResult } from "@/components/job-analysis/job-analysis-result";
import { JobAnalysisSkeleton } from "@/components/job-analysis/job-analysis-skeleton";
import { JobDescriptionForm } from "@/components/job-analysis/job-description-form";
import {
  jobAnalysisSchema,
  type JobAnalysis,
  type JobDescriptionFormValues,
} from "@/lib/job-analysis/schema";

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);

  async function handleSubmit(values: JobDescriptionFormValues) {
    setIsSubmitting(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Analysis failed. Please try again.";
        throw new Error(message);
      }

      setAnalysis(jobAnalysisSchema.parse(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          ai-job-expert
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Paste a job description to get a structured summary and a tailored
          cover letter.
        </p>
      </div>
      <JobDescriptionForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      {isSubmitting && <JobAnalysisSkeleton />}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!isSubmitting && analysis && <JobAnalysisResult analysis={analysis} />}
    </div>
  );
}
