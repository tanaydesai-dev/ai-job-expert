"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
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

export function CoverLetterForm({
  onSubmit,
  isSubmitting = false,
}: CoverLetterFormProps) {
  const form = useForm<CoverLetterFormValues>({
    resolver: zodResolver(coverLetterFormSchema),
    defaultValues: { name: "", background: "", tone: "professional" },
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Generate a cover letter</CardTitle>
        <CardDescription>
          Tell us a bit about yourself and we&apos;ll tailor a letter to this
          job.
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
            <Label htmlFor="background">Your background</Label>
            <Textarea
              id="background"
              placeholder="Summarize your relevant experience, skills, and achievements..."
              className="min-h-32 resize-y"
              disabled={isSubmitting}
              {...form.register("background")}
            />
            {form.formState.errors.background && (
              <p className="text-sm text-destructive">
                {form.formState.errors.background.message}
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
            {isSubmitting ? "Generating..." : "Generate cover letter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
