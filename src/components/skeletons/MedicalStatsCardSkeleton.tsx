import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const MedicalStatsCardSkeleton = () => {
    return (
        <div className="px-4">
            <Card className="relative overflow-hidden border-y border-white/5 shadow-sm bg-card/40 backdrop-blur-sm p-6 h-[140px] flex flex-col justify-between rounded-none">
                <div className="h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-12" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-none" />
                    </div>
                    <div className="space-y-1">
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            </Card>
        </div>
    );
};
