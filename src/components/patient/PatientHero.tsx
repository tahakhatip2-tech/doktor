import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    imageSrc = '/doktor-jo-auth-v2.png', // The newly generated 3D image
    showBackButton = false,
}: PatientHeroProps) {
    const navigate = useNavigate();

    return (
        <div className={cn("relative w-full overflow-hidden shadow-xl mb-6 group", className)}>
            {/* Background Image & Overlays */}
            <div className="absolute inset-0">
                <img
                    src={imageSrc}
                    alt="Happy Family Health"
                    className="w-full h-full object-cover object-[center_30%] scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out"
                />

                {/* 
                    Modern Gradient Overlay
                    Mix of Doctor Jo Blue (#2563EB) and Deep Trust Blue, fading gracefully.
                    We keep it slightly transparent to let the premium 3D image shine through.
                */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
            </div>

            {/* Glowing accents */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Content Container */}
            <div className="relative z-10 w-full px-4 py-6 sm:px-8 sm:py-8 md:px-10 lg:px-16 flex flex-col md:flex-row items-center md:items-stretch justify-center md:justify-between gap-4 md:gap-8 h-[50vh]">

                {/* Back to Home Button */}
                {showBackButton && (
                    <button
                        onClick={() => navigate('/patient/dashboard')}
                        className="absolute top-4 right-4 md:top-6 md:right-8 z-50 flex items-center gap-1.5 md:gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-md border border-white/20 shadow-xl transition-all font-bold text-[10px] md:text-sm active:scale-95 group/back"
                    >
                        <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5 transition-transform group-hover/back:-translate-x-1" />
                        <Home className="w-3.5 h-3.5 md:w-4 md:h-4 ml-0.5" />
                        <span>الرئيسية</span>
                    </button>
                )}

                {/* Left Side: Main Typography */}
                <div className="flex flex-col justify-center items-center text-center md:items-start md:text-right max-w-2xl w-full z-20 space-y-2 md:space-y-4 pt-4 md:pt-0">
                    {/* Tiny playful badge */}
                    {badgeText && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white shadow-sm mb-1 transform hover:-translate-y-1 transition-transform">
                            <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-orange-400" />
                            <span className="text-[10px] md:text-xs font-bold tracking-wider">{badgeText}</span>
                        </div>
                    )}

                    <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-5xl font-black text-white leading-[1.2] md:leading-[1.1] tracking-tight drop-shadow-lg">
                        {title}
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                            {subtitle}
                        </span>
                    </h1>

                    {description && (
                        <p className="text-xs md:text-base text-blue-50 max-w-lg leading-relaxed font-medium opacity-90 backdrop-blur-sm bg-black/10 p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5 shadow-inner">
                            {description}
                        </p>
                    )}
                </div>

                {/* Right Side: Dynamic Quick Info (Children widgets via Glassmorphism) */}
                {children && (
                    <div className="w-full md:w-auto h-full flex flex-col justify-center items-center md:items-end z-20 shrink-0">
                        {children}
                    </div>
                )}
            </div>

            {/* Decorative bottom wave or curve (Optional, modern touch) */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>
        </div>
    );
}
