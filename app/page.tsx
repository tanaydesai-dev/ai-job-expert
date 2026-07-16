"use client";

import { CircleAlert, Sparkles } from "lucide-react";
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex w-full max-w-2xl animate-in items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive fade-in-0 slide-in-from-top-1">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
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
    <div className="flex min-h-screen flex-col items-center gap-6 px-4 py-16 sm:py-20">
      <div className="relative flex flex-col items-center text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          AI-powered
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-primary">ai</span>-job-expert
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Paste a job description to get a structured summary and a tailored
          cover letter.
        </p>
      </div>

      <JobDescriptionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

      {isSubmitting && <JobAnalysisSkeleton />}
      {error && <ErrorMessage message={error} />}
      {!isSubmitting && analysis && (
        <JobAnalysisResult
          analysis={analysis}
          className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
        />
      )}

      {!isSubmitting && analysis && !showCoverLetterForm && !coverLetterText && (
        <Button
          size="lg"
          onClick={() => setShowCoverLetterForm(true)}
          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
        >
          <Sparkles />
          Generate cover letter
        </Button>
      )}

      {showCoverLetterForm && !coverLetterText && (
        <CoverLetterForm
          onSubmit={handleGenerateCoverLetter}
          isSubmitting={isGeneratingCoverLetter}
        />
      )}

      {coverLetterError && <ErrorMessage message={coverLetterError} />}

      {(coverLetterText || isGeneratingCoverLetter) && (
        <CoverLetterOutput
          text={coverLetterText}
          isStreaming={isGeneratingCoverLetter}
          fileName={
            analysis?.title
              ? `cover-letter-${slugify(analysis.title)}.txt`
              : undefined
          }
          className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
        />
      )}
    </div>
  );
}
