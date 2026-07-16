"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  jobDescriptionFormSchema,
  type JobDescriptionFormValues,
} from "@/lib/job-analysis/schema";

interface JobDescriptionFormProps {
  onSubmit: (values: JobDescriptionFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function JobDescriptionForm({
  onSubmit,
  isSubmitting = false,
}: JobDescriptionFormProps) {
  const form = useForm<JobDescriptionFormValues>({
    resolver: zodResolver(jobDescriptionFormSchema),
    defaultValues: { jobDescription: "" },
  });

  const jobDescription = useWatch({
    control: form.control,
    name: "jobDescription",
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Analyze a job description</CardTitle>
        <CardDescription>
          Paste the full job posting below to get a structured summary.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-2">
          <Textarea
            placeholder="Paste the job description here..."
            className="min-h-64 resize-y"
            disabled={isSubmitting}
            {...form.register("jobDescription")}
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{jobDescription?.length ?? 0} characters</span>
            {form.formState.errors.jobDescription && (
              <span className="text-destructive">
                {form.formState.errors.jobDescription.message}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="ml-auto"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Sparkles />
            )}
            {isSubmitting ? "Reading between the lines..." : "Analyze"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
