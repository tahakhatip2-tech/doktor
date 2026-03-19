import { useState } from "react";
import {
    Home,
    Users,
    Plus,
    Settings,
    MessagesSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AddAppointmentDialog from "@/components/AddAppointmentDialog";

interface BottomNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onSearchClick?: () => void;
}

export function BottomNav({ activeTab, setActiveTab, onSearchClick }: BottomNavProps) {
    const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'الرئيسية', icon: Home },
        { id: 'contacts', label: 'المرضى', icon: Users },
        { id: 'add-patient', label: 'إضافة', icon: Plus, isSpecial: true },
        { id: 'internal-chat', label: 'رسائل', icon: MessagesSquare },
        { id: 'clinic-settings', label: 'الإعدادات', icon: Settings },
    ];

    return (
        <>
            {/* 💎 Unified Mobile Navigation Bar - Doctor Portal */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                <nav className="h-[72px] bg-white/95 dark:bg-black/90 backdrop-blur-3xl border-t-2 border-orange-500 shadow-[0_-15px_60px_rgba(0,0,0,0.1)] flex justify-between items-center px-1 pb-1">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        const isMain = index === 2; // "Add" button center focus

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.isSpecial) {
                                        setIsAddPatientOpen(true);
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
                                        ? "h-14 w-14 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-orange-400 shadow-[0_8px_25px_rgba(249,115,22,0.4)] border-4 border-white dark:border-zinc-900 active:scale-95"
                                        : "p-2 rounded-xl transition-all duration-300",
                                    !isMain && isActive && "bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-500/50 shadow-sm"
                                )}>
                                    {isMain && (
                                        <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-20" />
                                    )}
                                    <Icon
                                        className={cn(
                                            "transition-all duration-300 stroke-[2.5]",
                                            isMain 
                                                ? "h-7 w-7 text-white" 
                                                : isActive ? "h-5 w-5 text-orange-600" : "h-4.5 w-4.5 text-blue-700/70"
                                        )}
                                    />
                                </div>

                                {/* Label - Micro-Typography */}
                                {!isMain ? (
                                    <span className={cn(
                                        "text-[8px] sm:text-[9px] font-black mt-0.5 transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-0.5",
                                        isActive ? "text-orange-600" : "text-blue-900/60"
                                    )}>
                                        {item.label}
                                    </span>
                                ) : (
                                    <span className="text-[9px] font-extrabold mt-0.5 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full shadow-sm">
                                        {item.label}
                                    </span>
                                )}

                                {/* Selection Dot */}
                                {!isMain && isActive && (
                                    <div className="absolute -bottom-0.5 h-1 w-1 bg-orange-600 rounded-full" />
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
        </>
    );
}
