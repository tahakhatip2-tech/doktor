import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PatientCardSkeleton = () => {
    return (
        <div className="px-3">
            <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-white/5 p-5 transition-all duration-300 rounded-none">
                <div className="space-y-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-none" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                        <Skeleton className="h-8 w-24 rounded-none" />
                        <Skeleton className="h-8 w-8 rounded-none" />
                    </div>
                </div>
            </Card>
        </div>
    );
};
