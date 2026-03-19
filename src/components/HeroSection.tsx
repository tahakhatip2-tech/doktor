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
}

export function HeroSection({
    doctorName = "د. حكيم",
    pageTitle,
    description,
    icon: Icon = Sparkles,
    className,
    stats,
    backgroundImage = "/hero-doctor.png",
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
        <div className={cn("relative w-full overflow-hidden shadow-2xl mb-4 md:mb-6 group rounded-none border border-white/5", className)}>
            {/* Background Image & Overlays */}
            <div className="absolute inset-0">
                <motion.img
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src={backgroundImage}
                    alt="Hero Background"
                    className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-[3s] ease-out"
                />

                {/* Modern High-End Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/70 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
                
                {/* Advanced Scanlines & Texture */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,0,0,0.02),rgba(0,0,0,0.02),rgba(0,0,0,0.02))] bg-[length:100%_2px,3px_100%]" />
            </div>

            {/* Glowing Accents */}
            <div className="absolute -top-8 -left-8 w-56 h-56 bg-blue-600 rounded-full mix-blend-screen filter blur-[80px] opacity-15 animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-56 h-56 bg-orange-500 rounded-full mix-blend-screen filter blur-[80px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Content Container — compressed height */}
            <div className="relative z-10 w-full px-5 py-3 md:px-10 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-8 h-[22vh] min-h-[160px] md:min-h-[180px]">
                
                {/* Left Side: Branding & Main Typography */}
                <div className="flex flex-col justify-center items-center text-center md:items-start md:text-right max-w-xl w-full z-20 space-y-1 md:space-y-2">
                    
                    {/* Micro-Badge */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/20 backdrop-blur-xl text-blue-100 shadow-xl"
                    >
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)]" />
                        <span className="text-[8px] md:text-[9px] font-black tracking-[0.2em] uppercase opacity-90">{brandingName} | {brandingDesc}</span>
                    </motion.div>

                    <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                        {doctorName}
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-lg sm:text-xl md:text-3xl">
                            {pageTitle}
                        </span>
                    </h1>

                    {description && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-[10px] md:text-sm text-blue-50/70 max-w-md leading-relaxed font-medium hidden sm:block"
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
                        className="bg-white/5 backdrop-blur-3xl border border-white/10 px-4 py-2.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl shadow-2xl flex flex-col items-center md:items-end gap-1.5 min-w-[170px] md:min-w-[200px] group/clock hover:bg-white/10 transition-all duration-500"
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 md:h-5 md:w-5 text-orange-400 animate-pulse" />
                            <span className="text-lg md:text-3xl font-black font-mono tabular-nums text-white tracking-tighter leading-none">
                                {timeString}
                            </span>
                        </div>
                        
                        <div className="w-full h-px bg-white/10" />
                        
                        <div className="flex items-center gap-1.5 text-blue-100/50">
                            <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
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
