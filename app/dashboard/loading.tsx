import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto py-8 px-4 min-h-[80vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}