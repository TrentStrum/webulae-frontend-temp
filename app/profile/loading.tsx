import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <Skeleton className="h-10 w-1/3 mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-10 w-32 mt-4" />
      </div>
    </main>
  );
}