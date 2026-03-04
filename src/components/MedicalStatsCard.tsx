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
            <Card className="aspect-square relative overflow-hidden p-4 md:p-6 transition-all duration-700 border border-white/10 bg-white/[0.08] backdrop-blur-[60px] rounded-none shadow-2xl group h-full cursor-pointer hover:shadow-primary/20">
                {/* 1. Content Layer */}
                <div className="h-full flex flex-col justify-between relative z-20">
                    <div className="light-sweep" />

                    {/* 2. Architectural Accent (Top Right) */}
                    <motion.div
                        whileHover={{ rotate: 0, scale: 1.25 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="absolute top-0 right-0 w-16 h-16 flex items-center justify-center -mr-4 -mt-4 opacity-5 group-hover:opacity-15 transition-all duration-700 rotate-12"
                    >
                        <Icon className="h-12 w-12 text-primary" />
                    </motion.div>

                    {/* 3. Content Layer */}
                    <div className="relative z-20 flex items-start gap-3 md:gap-5 pt-2">
                        {/* Vertical Flagship Ribbon */}
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 64 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="w-1.5 bg-gradient-to-b from-primary via-primary/50 to-transparent self-start rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                        />

                        <div className="flex flex-col items-start text-right flex-1 min-w-0 gap-1.5">
                            {/* Badge Style Label (Small/High Detail) */}
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center gap-2 mb-1.5"
                            >
                                <div className="p-1 rounded-sm bg-primary/20 text-primary">
                                    <Icon className="h-3 w-3" strokeWidth={3} />
                                </div>
                                <p className="text-[9px] md:text-[10px] font-black text-primary/80 uppercase tracking-[0.25em]">{title}</p>
                            </motion.div>

                            <div className="space-y-0.5">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
                                    className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground italic uppercase leading-none"
                                >
                                    {value}
                                </motion.div>
                                {subtitle && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.9 }}
                                        className="text-[9px] md:text-[11px] font-black text-muted-foreground/30 mt-1.5 uppercase tracking-widest pl-1 border-l border-white/5 italic"
                                    >
                                        {subtitle}
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 4. Bottom Professional "Power Line" */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        className="absolute bottom-0 left-0 flex opacity-40 group-hover:opacity-100 transition-opacity duration-1000"
                    >
                        <div className="h-[3px] w-2/5 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]" />
                        <div className="h-[3px] flex-1 bg-white/5" />
                    </motion.div>

                    {/* 5. Inner Glass Edge Shine (Double Border Feel) */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                <div className="absolute inset-0 pointer-events-none border-x border-white/5" />
            </Card>
        </motion.div>
    );
}

export { MedicalStatsCard };
