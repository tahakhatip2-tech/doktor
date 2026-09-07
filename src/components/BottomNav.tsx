import { useState } from "react";
import {
    Home,
    Users,
    Plus,
    Settings,
    MessagesSquare,
    Tag,
    FileText,
    Package,
    FlaskConical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkles, HeartPulse } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useClinicContext } from "@/context/ClinicContext";
import AddAppointmentDialog from "@/components/AddAppointmentDialog";
import AddProductDialog from "@/components/pharmacy/AddProductDialog";

interface BottomNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onSearchClick?: () => void;
}

export function BottomNav({ activeTab, setActiveTab, onSearchClick }: BottomNavProps) {
    const { user } = useAuth();
    const { settings } = useClinicContext();
    const isPharmacy = user?.role === 'PHARMACY';
    const isBeauty = settings?.clinic_category === 'beauty_center';
    const isHomeCare = settings?.clinic_category === 'home_care';
    const isLab = settings?.clinic_category === 'lab';
    
    const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);

    let navItems = isPharmacy ? [
        { id: 'dashboard', label: 'الرئيسية', icon: Home },
        { id: 'prescriptions', label: 'الوصفات', icon: FileText },
        { id: 'add-inventory', label: 'إضافة دواء', icon: Plus, isSpecial: true },
        { id: 'offers', label: 'الأخبار', icon: Tag },
        { id: 'inventory', label: 'الأدوية', icon: Package },
    ] : [
        { id: 'dashboard', label: 'الرئيسية', icon: Home },
        { id: 'contacts', label: 'المرضى', icon: Users },
        { id: 'add-patient', label: 'إضافة', icon: Plus, isSpecial: true },
        { id: 'offers', label: 'الأخبار', icon: Tag },
        { id: 'clinic-settings', label: 'الإعدادات', icon: Settings },
    ];

    if (isBeauty) {
        navItems = [
            { id: 'dashboard', label: 'الرئيسية', icon: Home },
            { id: 'contacts', label: 'المرضى', icon: Users },
            { id: 'add-patient', label: 'إضافة', icon: Plus, isSpecial: true },
            { id: 'beauty-services', label: 'الخدمات', icon: Sparkles },
            { id: 'clinic-settings', label: 'الإعدادات', icon: Settings },
        ];
    } else if (isHomeCare) {
        navItems = [
            { id: 'dashboard', label: 'الرئيسية', icon: Home },
            { id: 'contacts', label: 'المرضى', icon: Users },
            { id: 'add-patient', label: 'إضافة', icon: Plus, isSpecial: true },
            { id: 'homecare-services', label: 'الخدمات', icon: HeartPulse },
            { id: 'clinic-settings', label: 'الإعدادات', icon: Settings },
        ];
    } else if (isLab) {
        navItems = [
            { id: 'dashboard', label: 'الرئيسية', icon: Home },
            { id: 'contacts', label: 'المرضى', icon: Users },
            { id: 'add-patient', label: 'إضافة', icon: Plus, isSpecial: true },
            { id: 'lab-tests', label: 'الفحوصات', icon: FlaskConical },
            { id: 'clinic-settings', label: 'الإعدادات', icon: Settings },
        ];
    }

    // Dynamic color theme based on role
    const borderColor   = isPharmacy ? 'border-emerald-500'  : isBeauty ? 'border-fuchsia-500' : isHomeCare ? 'border-indigo-500' : isLab ? 'border-red-500' : 'border-orange-500';
    const mainBtnClass  = isPharmacy
        ? 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 shadow-[0_8px_25px_rgba(16,185,129,0.4)]'
        : isBeauty
        ? 'bg-gradient-to-tr from-fuchsia-600 via-purple-500 to-fuchsia-400 shadow-[0_8px_25px_rgba(217,70,239,0.4)]'
        : isHomeCare
        ? 'bg-gradient-to-tr from-indigo-600 via-violet-500 to-indigo-400 shadow-[0_8px_25px_rgba(79,70,229,0.4)]'
        : isLab
        ? 'bg-gradient-to-tr from-red-600 via-red-500 to-red-400 shadow-[0_8px_25px_rgba(220,38,38,0.4)]'
        : 'bg-gradient-to-tr from-orange-600 via-orange-500 to-orange-400 shadow-[0_8px_25px_rgba(249,115,22,0.4)]';
    const pingColor     = isPharmacy ? 'bg-emerald-400' : isBeauty ? 'bg-fuchsia-400' : isHomeCare ? 'bg-indigo-400' : isLab ? 'bg-red-400' : 'bg-orange-400';
    const activeBg      = isPharmacy ? 'bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500/50' : isBeauty ? 'bg-fuchsia-50 dark:bg-fuchsia-500/10 border-2 border-fuchsia-500/50' : isHomeCare ? 'bg-indigo-50 dark:bg-indigo-500/10 border-2 border-indigo-500/50' : isLab ? 'bg-red-50 dark:bg-red-500/10 border-2 border-red-500/50' : 'bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-500/50';
    const activeIcon    = isPharmacy ? 'text-emerald-600' : isBeauty ? 'text-fuchsia-600' : isHomeCare ? 'text-indigo-600' : isLab ? 'text-red-600' : 'text-orange-600';
    const activeDot     = isPharmacy ? 'bg-emerald-600' : isBeauty ? 'bg-fuchsia-600' : isHomeCare ? 'bg-indigo-600' : isLab ? 'bg-red-600' : 'bg-orange-600';
    const mainLabelCls  = isPharmacy ? 'text-emerald-600 bg-emerald-50' : isBeauty ? 'text-fuchsia-600 bg-fuchsia-50' : isHomeCare ? 'text-indigo-600 bg-indigo-50' : isLab ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50';

    return (
        <>
            {/* 💎 Unified Mobile Navigation Bar - Doctor Portal */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                <nav className={cn("h-[72px] bg-white/95 dark:bg-black/90 backdrop-blur-3xl border-t-2 shadow-[0_-15px_60px_rgba(0,0,0,0.1)] flex justify-between items-center px-1 pb-1", borderColor)}>
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        const isMain = index === 2; // "Add" button center focus

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.isSpecial) {
                                        if (isPharmacy) {
                                            setIsAddProductOpen(true);
                                        } else {
                                            setIsAddPatientOpen(true);
                                        }
                                    } else {
                                        setActiveTab(item.id);
                                    }
                                }}
                                className={cn(
                                    "flex flex-1 flex-col items-center justify-center transition-all duration-300 relative min-w-0 pointer-events-auto",
                                    isMain ? "-mt-8" : "mt-2",
                                    isActive ? "scale-105" : "opacity-80 hover:opacity-100"
                                )}
                            >
                                {/* Icon Container - Compressed & Unified Style */}
                                <div className={cn(
                                    "relative transition-all duration-500 flex items-center justify-center",
                                    isMain 
                                        ? `h-14 w-14 rounded-full ${mainBtnClass} border-4 border-white dark:border-zinc-900 active:scale-95`
                                        : "p-2 rounded-xl transition-all duration-300",
                                    !isMain && isActive && activeBg
                                )}>
                                    {isMain && (
                                        <div className={cn("absolute inset-0 rounded-full animate-ping opacity-20", pingColor)} />
                                    )}
                                    <Icon
                                        className={cn(
                                            "transition-all duration-300 stroke-[2.5]",
                                            isMain 
                                                ? "h-7 w-7 text-white" 
                                                : isActive ? cn("h-5 w-5", activeIcon) : "h-4.5 w-4.5 text-blue-700/70"
                                        )}
                                    />
                                </div>

                                {/* Label - Micro-Typography */}
                                {!isMain ? (
                                    <span className={cn(
                                        "text-[8px] sm:text-[9px] font-black mt-0.5 transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-0.5",
                                        isActive ? activeIcon : "text-blue-900/60"
                                    )}>
                                        {item.label}
                                    </span>
                                ) : (
                                    <span className={cn("text-[9px] font-extrabold mt-0.5 px-2 py-0.5 rounded-full shadow-sm", mainLabelCls)}>
                                        {item.label}
                                    </span>
                                )}

                                {/* Selection Dot */}
                                {!isMain && isActive && (
                                    <div className={cn("absolute -bottom-0.5 h-1 w-1 rounded-full", activeDot)} />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <AddAppointmentDialog
                open={isAddPatientOpen}
                onOpenChange={setIsAddPatientOpen}
                onSuccess={() => setActiveTab('appointments')}
            />
            
            <AddProductDialog
                open={isAddProductOpen}
                onOpenChange={setIsAddProductOpen}
                onSuccess={() => {
                    // Optional: navigate to inventory if they want to see it
                    // setActiveTab('inventory');
                }}
            />
        </>
    );
}
