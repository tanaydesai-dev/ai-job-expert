import {
  Briefcase,
  Building2,
  DollarSign,
  MapPin,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { JobAnalysis } from "@/lib/job-analysis/schema";

interface JobAnalysisResultProps {
  analysis: JobAnalysis;
  className?: string;
}

const WORK_MODE_LABELS: Record<JobAnalysis["workMode"], string | null> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
  unspecified: null,
};

export function JobAnalysisResult({
  analysis,
  className,
}: JobAnalysisResultProps) {
  const metaItems: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Location", value: analysis.location, icon: MapPin },
    {
      label: "Work mode",
      value: WORK_MODE_LABELS[analysis.workMode],
      icon: Building2,
    },
    {
      label: "Experience",
      value: analysis.experienceRequired,
      icon: Briefcase,
    },
    { label: "Salary range", value: analysis.salaryRange, icon: DollarSign },
  ].filter(
    (item): item is { label: string; value: string; icon: LucideIcon } =>
      item.value !== null,
  );

  return (
    <Card className={cn("w-full max-w-2xl overflow-hidden py-0", className)}>
      <div className="h-1 w-full bg-gradient-to-r from-primary via-fuchsia-500 to-primary/30" />
      <CardHeader className="pt-5">
        <CardTitle className="text-xl">
          {analysis.title ?? "Job summary"}
        </CardTitle>
        {analysis.company && (
          <p className="text-sm text-muted-foreground">{analysis.company}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pb-5">
        {metaItems.length > 0 && (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {metaItems.map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <item.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="text-sm">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}

        <div>
          <h3 className="mb-2 text-sm font-medium">Summary</h3>
          <p className="text-sm text-muted-foreground">
            {analysis.responsibilitiesSummary}
          </p>
        </div>

        {analysis.requiredSkills.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">Required skills</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.requiredSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.niceToHaves.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">Nice to have</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.niceToHaves.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
