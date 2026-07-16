import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobAnalysisSkeleton() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
