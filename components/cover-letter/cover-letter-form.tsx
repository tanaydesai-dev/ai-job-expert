"use client";

import { FileText, Loader2, Sparkles, Upload, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COVER_LETTER_TONES,
  coverLetterFormSchema,
  type CoverLetterFormValues,
} from "@/lib/cover-letter/schema";

interface CoverLetterFormProps {
  onSubmit: (values: CoverLetterFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

const TONE_LABELS: Record<(typeof COVER_LETTER_TONES)[number], string> = {
  professional: "Professional",
  enthusiastic: "Enthusiastic",
  formal: "Formal",
  conversational: "Conversational",
};

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CoverLetterForm({
  onSubmit,
  isSubmitting = false,
}: CoverLetterFormProps) {
  const form = useForm<CoverLetterFormValues>({
    resolver: zodResolver(coverLetterFormSchema),
    defaultValues: { name: "", tone: "professional" },
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Generate a cover letter</CardTitle>
        <CardDescription>
          Upload your resume and we&apos;ll tailor a letter to this job.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              disabled={isSubmitting}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resume">Your resume</Label>
            <Controller
              control={form.control}
              name="resume"
              render={({ field: { value, onChange } }) => (
                <div>
                  <input
                    id="resume"
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    disabled={isSubmitting}
                    onChange={(event) =>
                      onChange(event.target.files?.[0] ?? undefined)
                    }
                  />
                  {value ? (
                    <div className="flex items-center gap-3 rounded-lg border border-input bg-muted/40 px-3.5 py-2.5">
                      <FileText className="size-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {value.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(value.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0"
                        aria-label="Remove resume"
                        disabled={isSubmitting}
                        onClick={() => onChange(undefined)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="resume"
                      className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-input px-3.5 py-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 has-disabled:pointer-events-none has-disabled:opacity-50"
                    >
                      <Upload className="size-5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Click to upload your resume
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PDF, up to 5MB
                      </span>
                    </label>
                  )}
                </div>
              )}
            />
            {form.formState.errors.resume && (
              <p className="text-sm text-destructive">
                {form.formState.errors.resume.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tone">Tone</Label>
            <Controller
              control={form.control}
              name="tone"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="tone" className="w-full">
                    <SelectValue placeholder="Select a tone">
                      {(value: (typeof COVER_LETTER_TONES)[number] | null) =>
                        value ? TONE_LABELS[value] : "Select a tone"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COVER_LETTER_TONES.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {TONE_LABELS[tone]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
            {isSubmitting ? "Writing your pitch..." : "Generate cover letter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
