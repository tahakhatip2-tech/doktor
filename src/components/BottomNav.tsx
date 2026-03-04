import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Home,
    Users,
    Plus,
    User,
    Settings,
    MessagesSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import AddAppointmentDialog from "@/components/AddAppointmentDialog";

interface BottomNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onSearchClick?: () => void;
}

export function BottomNav({ activeTab, setActiveTab, onSearchClick }: BottomNavProps) {
    const navigate = useNavigate();
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
            <Card className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/[0.08] dark:bg-black/40 backdrop-blur-[40px] border-none border-t border-white/20 rounded-none z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex justify-around items-center px-2">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;

                    if (item.isSpecial) {
                        return (
                            <div key={item.id} className="flex items-center justify-center">
                                <Button
                                    size="icon"
                                    className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-orange-500 shadow-lg shadow-blue-600/30 border border-white/20 hover:scale-105 hover:shadow-orange-500/30 transition-all duration-300 flex items-center justify-center group"
                                    onClick={() => setIsAddPatientOpen(true)}
                                >
                                    <Plus className="h-6 w-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                                </Button>
                            </div>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.isAction && item.action) {
                                    item.action();
                                } else {
                                    setActiveTab(item.id);
                                }
                            }}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 transition-all duration-300 relative p-2 min-w-[60px]",
                                isActive ? "scale-105" : "opacity-70 hover:opacity-100"
                            )}
                        >
                            {/* Icon with background */}
                            <div className={cn(
                                "relative p-2 rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-gradient-to-tr from-blue-600 to-orange-500 shadow-lg shadow-blue-600/30"
                                    : "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            )}>
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 transition-all duration-300 stroke-[2]",
                                        isActive ? "text-white" : "text-blue-600 dark:text-blue-400"
                                    )}
                                />
                            </div>

                            {/* Label */}
                            <span className={cn(
                                "text-[9px] font-bold transition-all duration-300",
                                isActive
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-blue-400/70 dark:text-blue-400/50"
                            )}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </Card>

            <AddAppointmentDialog
                open={isAddPatientOpen}
                onOpenChange={setIsAddPatientOpen}
                onSuccess={() => setActiveTab('appointments')}
            />
        </>
    );
}
