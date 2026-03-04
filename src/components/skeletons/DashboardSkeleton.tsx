import { MedicalStatsCardSkeleton } from "./MedicalStatsCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const DashboardSkeleton = () => {
    return (
        <div className="space-y-8 md:space-y-12 pb-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {[...Array(4)].map((_, i) => (
                    <MedicalStatsCardSkeleton key={i} />
                ))}
            </div>

            {/* Toggle Skeleton */}
            <div className="px-4">
                <Skeleton className="w-full h-16 rounded-none" />
            </div>

            {/* Upcoming Appointments List */}
            <div className="space-y-4 px-4">
                <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-16" />
                </div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-none bg-card/30 border border-border/40">
                        <div className="w-full flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-none shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-6 w-16 rounded-none shrink-0" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Big Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-40 rounded-none bg-card/30 border-y border-white/5 p-6 flex items-center justify-between">
                        <div className="w-full flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-none" />
                                <div className="space-y-3">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-8 rounded-none" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
