import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PatientHeroProps {
    title: string;
    subtitle: string;
    description?: string;
    children?: ReactNode;
    className?: string;
    badgeText?: string;
    imageSrc?: string;
    showBackButton?: boolean;
}

export default function PatientHero({
    title,
    subtitle,
    description,
    children,
    className,
    badgeText,
    imageSrc = '/patient-hero-scene-v2.png',
    showBackButton = false,
}: PatientHeroProps) {
    const navigate = useNavigate();

    return (
        <div className={cn("relative w-full overflow-hidden shadow-2xl mb-4 md:mb-6 group rounded-none border border-white/5", className)}>
            {/* Background Image & Overlays */}
            <div className="absolute inset-0">
                <motion.img
                    initial={{ scale: 1.1, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src={imageSrc}
                    alt="Hero Background"
                    className="w-full h-full object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-[3s] ease-out"
                />

                {/* 
                    Modern High-End Gradient Overlay
                    A mix of deep trust blue and transparent tones to blend with the app background.
                */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
                
                {/* Visual Texture */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] hidden md:block" />
            </div>

            {/* Glowing Accents - Stunning & Professional */}
            <div className="absolute -top-12 -left-12 w-64 md:w-96 h-64 md:h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-12 -right-12 w-64 md:w-96 h-64 md:h-96 bg-orange-400 rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Content Container - 30% height of screen */}
            <div className="relative z-10 w-full px-5 py-3 md:px-10 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-8 h-[22vh] min-h-[160px] md:min-h-[180px]">

                {/* Back Button - Compact & Glassy */}
                {showBackButton && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/patient/dashboard')}
                        className="absolute top-2 right-4 md:top-4 md:right-6 z-50 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl transition-all font-bold text-[9px] md:text-xs"
                    >
                        <ArrowRight className="w-2.5 h-2.5 md:w-3.5 h-3.5" />
                        <Home className="w-2.5 h-2.5 md:w-3.5 h-3.5" />
                        <span>رجوع</span>
                    </motion.button>
                )}

                {/* Title & Info Wrapper - More compressed */}
                <div className="flex flex-col justify-center items-center text-center md:items-start md:text-right max-w-2xl w-full z-20 space-y-1 md:space-y-3 pt-1 md:pt-0">
                    
                    {/* Badge - Micro glassmorphism */}
                    {badgeText && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/20 backdrop-blur-xl text-white shadow-lg mb-0.5"
                        >
                            <Sparkles className="w-2.5 h-2.5 text-orange-400 animate-pulse" />
                            <span className="text-[8px] md:text-[10px] font-black tracking-widest uppercase">{badgeText}</span>
                        </motion.div>
                    )}

                    <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                        {title}
                        <br />
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 drop-shadow-sm text-lg sm:text-xl md:text-3xl mt-1">
                            {subtitle}
                        </span>
                    </h1>

                    {description && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-[9px] md:text-sm lg:text-base text-blue-50/80 max-w-lg leading-relaxed font-medium bg-black/20 backdrop-blur-md p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-white/5 shadow-inner hidden sm:block"
                        >
                            {description}
                        </motion.p>
                    )}
                </div>

                {/* Quick Info / Widgets - Right Side */}
                {children && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full md:w-auto flex flex-col justify-center items-center md:items-end z-20 shrink-0"
                    >
                        {children}
                    </motion.div>
                )}
            </div>

            {/* Premium Bottom Glow Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 bg-gradient-to-t from-background via-background/20 to-transparent z-[1] pointer-events-none" />
            
            {/* Light Sweep Animation */}
            <div className="light-sweep opacity-10 pointer-events-none" />
        </div>
    );
}
