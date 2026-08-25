import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Sparkles, Clock, Calendar, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useClinicContext } from '@/context/ClinicContext';

interface HeroSectionProps {
    doctorName?: string;
    pageTitle: string;
    description?: string;
    icon?: LucideIcon;
    className?: string;
    stats?: any[];
    backgroundImage?: string;
    children?: React.ReactNode;
    isPharmacy?: boolean;
}

export function HeroSection({
    doctorName = "د. حكيم",
    pageTitle,
    description,
    icon: Icon = Sparkles,
    className,
    stats,
    backgroundImage = "/doctor-jo-bg.png",
    children,
    isPharmacy = false
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
    
    // Theme classes based on isPharmacy
    const overlayGradient = isPharmacy 
        ? "from-emerald-950/60 via-emerald-900/35 to-transparent" 
        : "from-blue-950/60 via-blue-900/35 to-transparent";
        
    const glowColor1 = isPharmacy ? "bg-emerald-600" : "bg-blue-600";
    const glowColor2 = isPharmacy ? "bg-teal-500" : "bg-orange-500";
    
    const badgeBg = isPharmacy ? "bg-emerald-500/20 border-emerald-400/20 text-emerald-100" : "bg-blue-500/20 border-blue-400/20 text-blue-100";
    const badgeDot = isPharmacy ? "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,1)]" : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)]";
    
    const titleGradient = isPharmacy ? "from-emerald-300 via-teal-400 to-emerald-500" : "from-orange-400 via-orange-500 to-orange-600";
    
    const descColor = isPharmacy ? "text-emerald-50/80" : "text-blue-50/70";
    const clockIconColor = isPharmacy ? "text-teal-400" : "text-orange-400";
    const dateColor = isPharmacy ? "text-emerald-100/60" : "text-blue-100/50";

    return (
        <div className={cn("relative w-full overflow-hidden shadow-2xl mb-4 md:mb-6 group rounded-none border border-white/5", className)}>
            {/* Background Image & Overlays */}
            <div className="absolute inset-0 bg-black">
                <motion.img
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src={backgroundImage}
                    alt="Hero Background"
                    className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-[3s] ease-out mix-blend-screen opacity-90"
                />

                {/* Modern High-End Gradient Overlay */}
                <div className={cn("absolute inset-0 bg-gradient-to-r", overlayGradient)}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-50"></div>
                
                {/* Advanced Scanlines & Texture */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,0,0,0.02),rgba(0,0,0,0.02),rgba(0,0,0,0.02))] bg-[length:100%_2px,3px_100%]" />
            </div>

            {/* Glowing Accents */}
            <div className={cn("absolute -top-8 -left-8 w-56 h-56 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse", glowColor1)}></div>
            <div className={cn("absolute -bottom-8 -right-8 w-56 h-56 rounded-full mix-blend-screen filter blur-[80px] opacity-15 animate-pulse", glowColor2)} style={{ animationDelay: '2s' }}></div>

            {/* Content Container — compressed height */}
            <div className="relative z-10 w-full px-5 py-3 md:px-10 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-8 h-[22vh] min-h-[160px] md:min-h-[180px]">
                
                {/* Left Side: Branding & Main Typography */}
                <div className="flex flex-col justify-center items-center text-center md:items-start md:text-right max-w-xl w-full z-20 space-y-1 md:space-y-2">
                    
                    {/* Micro-Badge */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border backdrop-blur-xl shadow-xl", badgeBg)}
                    >
                        <div className={cn("h-1.5 w-1.5 rounded-full", badgeDot)} />
                        <span className="text-[8px] md:text-[9px] font-black tracking-[0.2em] uppercase opacity-90">
                            {isPharmacy ? `${brandingName} | PHARMACY SYSTEM` : `${brandingName} | ${brandingDesc}`}
                        </span>
                    </motion.div>

                    <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                        {doctorName}
                        <span className={cn("block text-transparent bg-clip-text bg-gradient-to-r text-lg sm:text-xl md:text-3xl", titleGradient)}>
                            {pageTitle}
                        </span>
                    </h1>

                    {description && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className={cn("text-[10px] md:text-sm max-w-md leading-relaxed font-medium hidden sm:block", descColor)}
                        >
                            {description}
                        </motion.p>
                    )}
                </div>

                {/* Right Side: Clock Widget */}
                <div className="w-full md:w-auto flex flex-col justify-center items-center md:items-end z-20 shrink-0 gap-2 md:gap-3">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-center md:items-end gap-1 group/clock"
                    >
                        <div className="flex items-center gap-1.5">
                            <Clock className={cn("h-3.5 w-3.5 animate-pulse", clockIconColor)} />
                            <span className="text-sm md:text-base font-bold font-mono tabular-nums text-white tracking-tighter leading-none">
                                {timeString}
                            </span>
                        </div>
                        
                        <div className={cn("flex items-center gap-1", dateColor)}>
                            <Calendar className="h-3 w-3" />
                            <span className="text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap">
                                {dateString}
                            </span>
                        </div>
                    </motion.div>

                    {/* Children elements (Quick Actions) */}
                    {children && (
                        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full">
                            {children}
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Interactive Light Slide */}
            <div className="light-sweep opacity-10 pointer-events-none" />
            
            {/* Elegant Bottom Edge Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 bg-gradient-to-t from-background via-background/20 to-transparent z-[1] pointer-events-none" />
        </div>
    );
}

export default HeroSection;
