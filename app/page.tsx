"use client";

import { useState } from "react";

import { CoverLetterForm } from "@/components/cover-letter/cover-letter-form";
import { CoverLetterOutput } from "@/components/cover-letter/cover-letter-output";
import { JobAnalysisResult } from "@/components/job-analysis/job-analysis-result";
import { JobAnalysisSkeleton } from "@/components/job-analysis/job-analysis-skeleton";
import { JobDescriptionForm } from "@/components/job-analysis/job-description-form";
import { Button } from "@/components/ui/button";
import type { CoverLetterFormValues } from "@/lib/cover-letter/schema";
import {
  jobAnalysisSchema,
  type JobAnalysis,
  type JobDescriptionFormValues,
} from "@/lib/job-analysis/schema";

function extractErrorMessage(data: unknown, fallback: string): string {
  return typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string"
    ? data.error
    : fallback;
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);

  const [showCoverLetterForm, setShowCoverLetterForm] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] =
    useState(false);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [coverLetterError, setCoverLetterError] = useState<string | null>(
    null,
  );

  async function handleSubmit(values: JobDescriptionFormValues) {
    setIsSubmitting(true);
    setError(null);
    setAnalysis(null);
    setJobDescription(values.jobDescription);
    setShowCoverLetterForm(false);
    setCoverLetterText("");
    setCoverLetterError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          extractErrorMessage(data, "Analysis failed. Please try again."),
        );
      }

      setAnalysis(jobAnalysisSchema.parse(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGenerateCoverLetter(values: CoverLetterFormValues) {
    if (!jobDescription) return;

    setCoverLetterError(null);
    setCoverLetterText("");
    setIsGeneratingCoverLetter(true);

    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, jobDescription }),
      });

      if (!response.ok || !response.body) {
        const data: unknown = await response.json().catch(() => null);
        throw new Error(
          extractErrorMessage(
            data,
            "Could not generate a cover letter. Please try again.",
          ),
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setCoverLetterText(text);
      }
    } catch (err) {
      setCoverLetterError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setIsGeneratingCoverLetter(false);
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

      <JobDescriptionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

      {isSubmitting && <JobAnalysisSkeleton />}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!isSubmitting && analysis && <JobAnalysisResult analysis={analysis} />}

      {!isSubmitting && analysis && !showCoverLetterForm && !coverLetterText && (
        <Button onClick={() => setShowCoverLetterForm(true)}>
          Generate cover letter
        </Button>
      )}

      {showCoverLetterForm && !coverLetterText && (
        <CoverLetterForm
          onSubmit={handleGenerateCoverLetter}
          isSubmitting={isGeneratingCoverLetter}
        />
      )}

      {coverLetterError && (
        <p className="text-sm text-destructive">{coverLetterError}</p>
      )}

      {(coverLetterText || isGeneratingCoverLetter) && (
        <CoverLetterOutput
          text={coverLetterText}
          isStreaming={isGeneratingCoverLetter}
        />
      )}
    </div>
  );
}
