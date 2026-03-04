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
                "relative w-full mb-6 md:mb-12 overflow-hidden border border-white/10 bg-blue-950/40 backdrop-blur-xl group shadow-[0_0_50px_rgba(0,0,0,0.3)] rounded-none",
                className
            )}
        >
            {/* Ambient Glows - Matching Auth Identity */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-1000"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-colors duration-1000"></div>

            {/* 1. Ultra-Luxury Background Layering */}
            <div className="absolute inset-0">
                {/* Image Base */}
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0 opacity-[0.12] mix-blend-overlay bg-cover bg-center pointer-events-none grayscale"
                    style={{ backgroundImage: 'url(/auth-bg-pro.png?v=6)' }}
                />

                {/* Advanced Medical Scanlines Utility */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,0,0,0.02),rgba(0,0,0,0.02),rgba(0,0,0,0.02))] bg-[length:100%_2px,3px_100%]" />

                {/* High-Tech Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
            </div>

            {/* 2. Content Layer */}
            <div className="relative z-10 px-4 py-4 md:px-12 md:py-10 flex flex-col items-center md:items-start md:flex-row md:justify-between text-right overflow-hidden gap-6 md:gap-8">

                {/* BRANDING SECTION */}
                <div className="flex flex-col items-center md:items-start gap-2 relative flex-1 order-2 md:order-1 w-full">

                    {/* Ghost Branding (Background) */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 0.03 }}
                        className="absolute -top-10 -right-16 pointer-events-none select-none text-7xl md:text-9xl font-black italic uppercase tracking-tighter whitespace-nowrap leading-none transition-transform duration-1000 opacity-[0.02]"
                    >
                        {brandingName}
                    </motion.div>

                    {/* Dynamic Token - Styled Like Auth Labels */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="px-4 py-1 rounded-none bg-blue-950/30 border border-blue-500/30 backdrop-blur-md flex items-center gap-2 w-fit mb-1 md:mb-2 group/token hover:bg-white/5 transition-colors"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                        <span className="text-[9px] font-black text-blue-200 tracking-[0.2em] uppercase">
                            {brandingDesc}
                        </span>
                    </motion.div>

                    {/* Typewriter Doctor Name Title - Professional White */}
                    <div className="relative inline-block" key={`${doctorName}-${pageTitle}`}>
                        <div className="flex items-center">
                            <motion.h1
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "auto", opacity: 1 }}
                                transition={{
                                    width: { duration: 1.2, ease: "easeOut" },
                                    opacity: { duration: 0.3 }
                                }}
                                className="text-2xl md:text-5xl font-black tracking-tight leading-none text-white drop-shadow-md whitespace-nowrap overflow-hidden pr-2 py-1"
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
                                className="inline-block w-[4px] h-[0.8em] bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"
                            />
                        </div>

                        {/* Reflection Layer - Adjusted for White Text */}
                        <div className="absolute inset-0 pointer-events-none select-none flex items-center translate-y-[2px] opacity-10 overflow-hidden">
                            <motion.span
                                initial={{ width: 0 }}
                                animate={{ width: "auto" }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="text-2xl md:text-5xl font-black text-white tracking-tight leading-none italic uppercase whitespace-nowrap"
                            >
                                {doctorName}
                            </motion.span>
                        </div>
                    </div>

                    {/* Vision Tagline - Added for Auth consistency */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 0.5 }}
                        className="text-[10px] md:text-xs font-bold text-blue-300/80 uppercase tracking-widest mt-1 mr-1"
                    >
                        Precision Medical Technology • Next Gen CRM
                    </motion.p>
                </div>

                {/* CLOCK SECTION (Auth Style Sharp Glass) */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex order-1 md:order-2 self-center md:self-auto gap-4 items-center"
                >
                    <div className="relative p-4 md:p-6 bg-white/[0.08] backdrop-blur-2xl border border-white/20 rounded-none shadow-2xl flex flex-col items-center justify-center gap-1.5 group/clock overflow-hidden min-w-[150px] md:min-w-[200px] hover:bg-white/[0.12] transition-all duration-500">
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover/clock:opacity-100 transition-opacity duration-1000" />

                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover/clock:bg-white/20 transition-colors"></div>

                        <div className="flex items-center gap-2.5 relative z-10">
                            <Clock className="h-4 w-4 md:h-6 md:w-6 text-orange-500 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                            <span className="text-2xl md:text-4xl font-black font-mono tabular-nums text-white tracking-tighter leading-none drop-shadow-lg">
                                {timeString}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 relative z-10 py-1 px-4 bg-white/5 border border-white/10 rounded-none mt-1 group-hover/clock:border-orange-500/30 transition-colors">
                            <Calendar className="h-3 w-3 text-blue-400" />
                            <span className="text-[9px] md:text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] whitespace-nowrap">
                                {dateString}
                            </span>
                        </div>

                        {/* Bottom Accent Line */}
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent origin-center scale-x-50 group-hover/clock:scale-x-100 transition-transform duration-700" />
                    </div>
                </motion.div>
            </div>

            {/* 3. PAGE TITLE STRIP (Matching Auth Panel) */}
            <div className="relative z-10 w-full border-t border-white/10 bg-blue-950/20 backdrop-blur-md">
                <div className="px-4 py-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="h-8 w-1.5 bg-gradient-to-b from-blue-600 to-orange-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        <div className="flex flex-col">
                            <motion.h2
                                key={pageTitle}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm md:text-xl font-black text-white uppercase tracking-wider leading-none"
                            >
                                {pageTitle === 'الرؤية الوطنية' ? 'رؤيتنا' : pageTitle}
                            </motion.h2>
                            {/* Professional Subtitle Description */}
                            <div className="hidden md:flex mt-1.5 relative overflow-hidden group/desc">
                                <p className="text-[10px] font-bold text-blue-300/60 leading-none pl-3 border-r-2 border-orange-500/30 transition-all group-hover/desc:border-orange-500 group-hover/desc:text-blue-200 group-hover/desc:pr-4">
                                    {description || "نظام متكامل لإدارة العيادات الطبية بأحدث تقنيات الذكاء الاصطناعي"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Slot - Responsive Width */}
                    <div className="flex items-center gap-4 relative z-20 w-full md:w-auto justify-end">
                        {children}
                    </div>
                </div>
            </div>

            {/* 4. Global Glass Overlay & Premium Finishing */}
            <div className="absolute inset-0 pointer-events-none border-x border-white/5" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Interactive Light Refraction Slide */}
            <div className="light-sweep opacity-10 group-hover:opacity-30 transition-opacity duration-1000" />
        </motion.div>
    );
}

export default HeroSection;
