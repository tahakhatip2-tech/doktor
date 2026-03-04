import { Skeleton } from "@/components/ui/skeleton";
import { MedicalStatsCardSkeleton } from "./MedicalStatsCardSkeleton";

export const ClinicStatsSkeleton = () => {
    return (
        <div className="space-y-8 pb-10" dir="rtl">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <MedicalStatsCardSkeleton key={i} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
                {/* Main Visits Chart Skeleton */}
                <div className="lg:col-span-2 h-[450px] rounded-none bg-card/30 border-y border-white/5 p-8 relative overflow-hidden skew-x-[-12deg]">
                    <div className="skew-x-[12deg] h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-8 w-8" />
                        </div>
                        <Skeleton className="w-full h-[300px] rounded-none" />
                    </div>
                </div>

                {/* Distribution Chart Skeleton */}
                <div className="h-[450px] rounded-none bg-card/30 border-y border-white/5 p-8 relative overflow-hidden skew-x-[-12deg]">
                    <div className="skew-x-[12deg] h-full">
                        <div className="mb-8 space-y-2">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex items-center justify-center h-[280px]">
                            <Skeleton className="h-48 w-48 rounded-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Insights Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-40 rounded-none bg-card/30 border border-white/5 p-8 skew-x-[-12deg]">
                        <div className="skew-x-[12deg] h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <Skeleton className="h-10 w-10 rounded-none" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3 mt-2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
