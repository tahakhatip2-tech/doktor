import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Sparkles, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useClinicContext } from '@/context/ClinicContext';

interface HeroSectionProps {
    doctorName?: string;
    pageTitle: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
    stats?: any[];
    children?: React.ReactNode;
}

export function HeroSection({
    doctorName = "د. حكيم",
    pageTitle,
    description,
    icon: Icon = Sparkles,
    className,
    stats,
    children
}: HeroSectionProps) {
    const { settings } = useClinicContext();
    const brandingName = settings?.clinic_name || "HAKEEM";
    const brandingDesc = settings?.clinic_description || "Medical System";
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    const dateString = currentTime.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
                "relative w-full mb-6 md:mb-12 overflow-hidden border border-orange-500 bg-white shadow-sm hover:shadow-xl rounded-md transition-all duration-500 group",
                className
            )}
        >
            {/* Ambient Glows */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-1000"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/10 transition-colors duration-1000"></div>

            {/* Gradient Edge Line */}
            <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10"></div>

            {/* Background Texture Layering */}
            <div className="absolute inset-0 z-0">
                {/* Subtle Dots Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                
                {/* Advanced Scanlines */}
                <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,0,0,0.02),rgba(0,0,0,0.02),rgba(0,0,0,0.02))] bg-[length:100%_2px,3px_100%]" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 px-4 py-6 md:px-12 md:py-10 flex flex-col items-center md:items-start md:flex-row md:justify-between text-right overflow-hidden gap-6 md:gap-8 bg-gradient-to-l from-white/40 via-transparent to-transparent">

                {/* BRANDING SECTION */}
                <div className="flex flex-col items-center md:items-start gap-2 relative flex-1 order-2 md:order-1 w-full">

                    {/* Ghost Branding (Background) */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 0.02 }}
                        className="absolute -top-10 -right-16 pointer-events-none select-none text-7xl md:text-9xl font-black italic uppercase tracking-tighter whitespace-nowrap leading-none transition-transform duration-1000 text-slate-900"
                    >
                        {brandingName}
                    </motion.div>

                    {/* Dynamic Token */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="px-4 py-1.5 rounded-sm bg-blue-50 border border-blue-100 shadow-sm flex items-center gap-2 w-fit mb-1 md:mb-2 group/token hover:bg-blue-100 transition-colors"
                    >
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                        <span className="text-[10px] font-black text-blue-700 tracking-[0.2em] uppercase">
                            {brandingDesc}
                        </span>
                    </motion.div>

                    {/* Typewriter Doctor Name Title */}
                    <div className="relative inline-block" key={`${doctorName}-${pageTitle}`}>
                        <div className="flex items-center">
                            <motion.h1
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "auto", opacity: 1 }}
                                transition={{
                                    width: { duration: 1.2, ease: "easeOut" },
                                    opacity: { duration: 0.3 }
                                }}
                                className="text-3xl md:text-5xl font-black tracking-tight leading-none text-slate-900 drop-shadow-sm whitespace-nowrap overflow-hidden pr-2 py-1"
                            >
                                {doctorName}
                            </motion.h1>

                            <motion.span
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                                className="inline-block w-[4px] h-[0.8em] bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] ml-1"
                            />
                        </div>

                        {/* Reflection Layer */}
                        <div className="absolute inset-0 pointer-events-none select-none flex items-center translate-y-[2px] opacity-[0.03] overflow-hidden">
                            <motion.span
                                initial={{ width: 0 }}
                                animate={{ width: "auto" }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none italic uppercase whitespace-nowrap"
                            >
                                {doctorName}
                            </motion.span>
                        </div>
                    </div>

                    {/* Vision Tagline */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 0.5 }}
                        className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 mr-1"
                    >
                        Precision Medical Technology • Next Gen CRM
                    </motion.p>
                </div>

                {/* CLOCK SECTION */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex order-1 md:order-2 self-center md:self-auto gap-4 items-center relative z-20"
                >
                    <div className="relative p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-md shadow-sm flex flex-col items-center justify-center gap-1.5 group/clock overflow-hidden min-w-[150px] md:min-w-[200px] hover:border-blue-300 transition-all duration-500">
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover/clock:opacity-100 transition-opacity duration-1000" />

                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-100/50 rounded-full blur-2xl group-hover/clock:bg-blue-200/50 transition-colors"></div>

                        <div className="flex items-center gap-2.5 relative z-10">
                            <Clock className="h-4 w-4 md:h-6 md:w-6 text-orange-500 animate-pulse drop-shadow-sm" />
                            <span className="text-2xl md:text-4xl font-black font-mono tabular-nums text-slate-900 tracking-tighter leading-none">
                                {timeString}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 relative z-10 py-1.5 px-4 bg-white border border-slate-100 rounded-sm mt-2 shadow-sm group-hover/clock:border-blue-200 transition-colors">
                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] whitespace-nowrap">
                                {dateString}
                            </span>
                        </div>

                        {/* Bottom Accent Line */}
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent origin-center scale-x-50 group-hover/clock:scale-x-100 transition-transform duration-700" />
                    </div>
                </motion.div>
            </div>

            {/* PAGE TITLE STRIP */}
            <div className="relative z-20 w-full border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm">
                <div className="px-4 py-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-blue-600 to-orange-500 shadow-sm" />
                        <div className="flex flex-col">
                            <motion.h2
                                key={pageTitle}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm md:text-xl font-black text-slate-900 uppercase tracking-wider leading-none"
                            >
                                {pageTitle === 'الرؤية الوطنية' ? 'رؤيتنا' : pageTitle}
                            </motion.h2>
                            {/* Professional Subtitle Description */}
                            <div className="hidden md:flex mt-1.5 relative overflow-hidden group/desc">
                                <p className="text-[10px] font-bold text-slate-500 leading-none pl-3 border-r-2 border-orange-400 transition-all group-hover/desc:border-orange-500 group-hover/desc:text-slate-700 group-hover/desc:pr-4">
                                    {description || "نظام متكامل لإدارة العيادات الطبية بأحدث تقنيات الذكاء الاصطناعي"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Slot */}
                    <div className="flex items-center gap-4 relative z-30 w-full md:w-auto justify-end">
                        {children}
                    </div>
                </div>
            </div>

            {/* Interactive Light Slide */}
            <div className="light-sweep opacity-30 group-hover:opacity-60 transition-opacity duration-1000" />
        </motion.div>
    );
}

export default HeroSection;
