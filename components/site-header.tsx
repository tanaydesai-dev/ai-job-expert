import { Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-fuchsia-500 text-primary-foreground shadow-sm shadow-primary/30">
            <Sparkles className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">
            ai-job-expert
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
