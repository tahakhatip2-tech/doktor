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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
            }}
            className="h-full"
        >
            <Card className="aspect-square relative overflow-hidden p-4 md:p-6 transition-all duration-300 border border-orange-500 bg-white shadow-sm hover:shadow-xl rounded-md group h-full cursor-pointer flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10"></div>
                
                <div className="relative z-20 flex justify-between items-start">
                    <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-600 transition-colors border border-blue-100 group-hover:border-blue-600 shadow-sm flex items-center justify-center">
                        <Icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                </div>

                <div className="relative z-20 flex flex-col items-start gap-1">
                    <p className="text-xs md:text-sm font-bold text-slate-500">{title}</p>
                    <div className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 font-display">
                        {value}
                    </div>
                    {subtitle && (
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}

export { MedicalStatsCard };
