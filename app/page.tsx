"use client";

import { useState } from "react";

import { JobDescriptionForm } from "@/components/job-analysis/job-description-form";
import type { JobDescriptionFormValues } from "@/lib/job-analysis/schema";

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: JobDescriptionFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const data = await response.json();
      // Phase 3 will render this as a structured summary.
      console.log("Analysis result:", data);
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
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
