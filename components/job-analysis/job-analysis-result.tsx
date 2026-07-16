import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { JobAnalysis } from "@/lib/job-analysis/schema";

interface JobAnalysisResultProps {
  analysis: JobAnalysis;
}

const WORK_MODE_LABELS: Record<JobAnalysis["workMode"], string | null> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
  unspecified: null,
};

export function JobAnalysisResult({ analysis }: JobAnalysisResultProps) {
  const metaItems = [
    { label: "Location", value: analysis.location },
    { label: "Work mode", value: WORK_MODE_LABELS[analysis.workMode] },
    { label: "Experience", value: analysis.experienceRequired },
    { label: "Salary range", value: analysis.salaryRange },
  ].filter(
    (item): item is { label: string; value: string } => item.value !== null,
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">
          {analysis.title ?? "Job summary"}
        </CardTitle>
        {analysis.company && (
          <p className="text-sm text-muted-foreground">{analysis.company}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {metaItems.length > 0 && (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {metaItems.map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="text-sm">{item.value}</dd>
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
