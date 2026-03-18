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
        <div className={cn("relative w-full overflow-hidden shadow-2xl mb-4 md:mb-8 group rounded-2xl md:rounded-3xl border border-white/10", className)}>
            {/* Background Image & Overlays */}
            <div className="absolute inset-0">
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src={backgroundImage}
                    alt="Doctor Hero Background"
                    className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-[3s] ease-out opacity-70"
                />

                {/* 
                    Modern Gradient Overlay
                    A mix of Doctor Jo Blue (#2563EB) and Deep Trust Blue.
                */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent"></div>
                
                {/* Advanced Scanlines */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,0,0,0.02),rgba(0,0,0,0.02),rgba(0,0,0,0.02))] bg-[length:100%_2px,3px_100%]" />
            </div>

            {/* Glowing accents */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-pulse"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-orange-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Content Container */}
            <div className="relative z-10 w-full px-5 py-6 md:px-10 md:py-8 flex flex-col md:flex-row items-center md:items-center justify-between gap-6 min-h-[auto] md:h-[35vh]">
                
                {/* Left Side: Main Typography */}
                <div className="flex flex-col justify-center items-center text-center md:items-start md:text-right max-w-3xl w-full z-20 space-y-3 pt-2 md:pt-0">
                    
                    {/* Professional Badge */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/20 backdrop-blur-xl text-blue-100 shadow-lg mb-1"
                    >
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[9px] md:text-[10px] font-black tracking-widest uppercase opacity-80">{brandingName} | {brandingDesc}</span>
                    </motion.div>

                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-xl">
                        {doctorName}
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600">
                            {pageTitle}
                        </span>
                    </h1>

                    {description && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xs md:text-base text-blue-50/70 max-w-lg leading-relaxed font-medium bg-black/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/5 shadow-xl hidden sm:block"
                        >
                            {description}
                        </motion.p>
                    )}
                </div>

                {/* Right Side: Modern Glassmorphic Clock & Actions */}
                <div className="w-full md:w-auto flex flex-col justify-center items-center md:items-end z-20 shrink-0 gap-4 md:gap-5">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 backdrop-blur-3xl border border-white/10 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col items-center md:items-end gap-2 md:gap-3 min-w-[200px] md:min-w-[220px] group/clock hover:bg-white/10 transition-all duration-500"
                    >
                        <div className="flex items-center gap-2.5">
                            <Clock className="h-4 w-4 md:h-5 md:w-5 text-orange-400" />
                            <span className="text-xl md:text-3xl font-black font-mono tabular-nums text-white tracking-tighter leading-none">
                                {timeString}
                            </span>
                        </div>
                        
                        <div className="w-full h-px bg-white/10" />
                        
                        <div className="flex items-center gap-2 text-blue-100/50">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">
                                {dateString}
                            </span>
                        </div>
                    </motion.div>

                    {/* Children elements (Actions) */}
                    {children && (
                        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full">
                            {children}
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Decorative Light Sweep */}
            <div className="light-sweep opacity-10 pointer-events-none" />
            
            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background via-background/20 to-transparent z-[1] pointer-events-none" />
        </div>
    );
}

export default HeroSection;

