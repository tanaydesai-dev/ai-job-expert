"use client";

import { Check, Copy, Download, Mail } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CoverLetterOutputProps {
  text: string;
  isStreaming: boolean;
  fileName?: string;
  className?: string;
}

export function CoverLetterOutput({
  text,
  isStreaming,
  fileName = "cover-letter.txt",
  className,
}: CoverLetterOutputProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="size-4 text-primary" />
          Your cover letter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">
          {text}
          {isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary align-text-bottom" />
          )}
        </p>
      </CardContent>
      {!isStreaming && text && (
        <CardFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="text-primary" />
            ) : (
              <Copy />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download />
            Download
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
