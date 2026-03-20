import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicalStatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color?: "blue" | "green" | "orange" | "purple";
    trend?: "up" | "down" | "neutral";
    backgroundImage?: string;
}

import { motion } from "framer-motion";

const MedicalStatsCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "blue",
    trend = "neutral",
    backgroundImage
}: MedicalStatsCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.03 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
            }}
            className="h-full"
        >
            <Card className="relative overflow-hidden py-2 px-3 md:py-3 md:px-4 transition-all duration-300 border border-orange-500 bg-white shadow-sm hover:shadow-md rounded-2xl group h-full cursor-pointer flex flex-col justify-center gap-1.5">
                
                {/* Top Row: Icon and Value */}
                <div className="relative z-20 flex justify-between items-center pr-2">
                    <div className="p-2 md:p-2.5 rounded-xl bg-blue-50/80 group-hover:bg-orange-50/80 border border-blue-100/50 group-hover:border-orange-200 transition-colors flex items-center justify-center shadow-sm">
                        <Icon className="h-4 w-4 md:h-5 md:w-5 text-blue-600 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-blue-900 font-display px-1 tracking-tighter">
                        {value}
                    </div>
                </div>

                {/* Bottom Row: Text content */}
                <div className="relative z-20 flex flex-col items-start pr-2">
                    <p className="text-[11px] md:text-[13px] font-black text-slate-700 leading-none">{title}</p>
                    {subtitle && (
                        <p className="text-[8px] md:text-[10px] font-bold text-slate-400 mt-1 md:mt-1.5 uppercase tracking-wider">
                            {subtitle}
                        </p>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}

export { MedicalStatsCard };
