import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

interface Appointment {
    id: string;
    patientName: string;
    time: string;
    date?: string;
    type: string;
    status: "scheduled" | "confirmed" | "waiting";
}

interface UpcomingAppointmentsProps {
    appointments?: Appointment[];
    onViewAll?: () => void;
}

export function UpcomingAppointments({ appointments = [], onViewAll }: UpcomingAppointmentsProps) {
    const displayAppointments = appointments;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: "spring" as const, stiffness: 300, damping: 24 }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="px-4"
        >
            <Card className="p-3 md:p-6 border border-white/10 bg-white/[0.08] backdrop-blur-[80px] rounded-none shadow-2xl overflow-hidden relative group transition-all duration-700">
                <div className="">
                    {/* 1. Ultra-Premium Light Sweep */}
                    <div className="light-sweep" />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-12 relative z-10 gap-4 sm:gap-0">
                        <div className="flex items-center gap-3 md:gap-4">
                            <motion.div
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-10 md:h-12 w-1 md:w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)] origin-top"
                            />
                            <div>
                                <h3 className="text-lg md:text-3xl font-black text-foreground tracking-tighter italic uppercase leading-none">المواعيد القادمة</h3>
                                <p className="text-[8px] md:text-[11px] font-black text-primary uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1 md:mt-2 opacity-70">Visit Schedule Analytics</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onViewAll}
                            className="h-8 md:h-10 px-4 md:px-8 font-black text-primary hover:bg-primary/10 transition-all text-[9px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] border border-primary/20 backdrop-blur-md self-end sm:self-auto"
                        >
                            عرض الكل
                            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        </Button>
                    </div>

                    {/* List Header Accent */}
                    <div className="hidden md:flex items-center gap-4 mb-6 opacity-20 px-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-12">Patient Detail</span>
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-12">Schedule</span>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3 relative z-10"
                    >
                        {displayAppointments.map((appointment) => (
                            <motion.div
                                key={appointment.id}
                                variants={itemVariants}
                                whileHover={{ scale: 1.01, x: 5 }}
                                className="group/item flex flex-col md:flex-row items-start md:items-center gap-4 p-3 md:p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-primary/40 transition-all duration-700 cursor-pointer relative overflow-hidden"
                            >
                                {/* Refactored Mobile Layout - Vertical Stack */}
                                <div className="w-full flex md:hidden flex-col gap-3">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="h-10 w-1 bg-primary/20 group-hover/item:bg-primary group-hover/item:h-full transition-all duration-700 rounded-full" />
                                        <div className="h-10 w-10 bg-blue-950/40 flex items-center justify-center text-primary border border-white/10 shadow-lg group-hover/item:scale-105 transition-transform shrink-0 rounded-lg">
                                            <User className="h-5 w-5" strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-black text-sm text-foreground group-hover/item:text-primary transition-colors italic uppercase tracking-tighter leading-none truncate pl-2">
                                                    {appointment.patientName}
                                                </p>
                                                <div className="text-[8px] font-black px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary uppercase tracking-[0.1em] inline-block w-fit rounded-sm shrink-0">
                                                    {appointment.type}
                                                </div>
                                            </div>
                                            {appointment.date && (
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-foreground/50 uppercase tracking-widest pl-2">
                                                    <Calendar className="h-3 w-3 text-primary opacity-70" />
                                                    <span>{appointment.date}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full pl-1">
                                        <div className="flex items-center justify-center gap-2 text-xs font-black text-primary bg-primary/10 w-full py-2 border border-primary/30 tabular-nums italic shadow-[0_0_20px_rgba(var(--primary),0.1)] rounded-sm">
                                            <Clock className="h-3.5 w-3.5" strokeWidth={3} />
                                            <span>{appointment.time}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Layout - Hidden on Mobile */}
                                <div className="hidden md:flex w-full items-center justify-between gap-4">
                                    {/* Item Hover Light Sweep */}
                                    <div className="light-sweep opacity-30" />

                                    <div className="flex items-center gap-3 md:gap-6 relative z-10 flex-1 min-w-0">
                                        <div className="h-10 w-1 md:h-14 md:w-1 bg-primary/20 group-hover/item:bg-primary group-hover/item:h-full transition-all duration-700 self-stretch" />
                                        <div className="h-10 w-10 md:h-14 md:w-14 bg-blue-950/40 flex items-center justify-center text-primary border border-white/10 shadow-lg group-hover/item:scale-105 transition-transform shrink-0">
                                            <User className="h-5 w-5 md:h-7 md:w-7" strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col gap-1 text-right min-w-0">
                                            <p className="font-black text-sm md:text-xl text-foreground group-hover/item:text-primary transition-colors italic uppercase tracking-tighter leading-none truncate block">
                                                {appointment.patientName}
                                            </p>
                                            <div className="text-[8px] md:text-[9px] font-black px-2 py-0.5 md:px-2.5 md:py-1 bg-primary/10 border border-primary/20 text-primary uppercase tracking-[0.1em] md:tracking-[0.15em] inline-block w-fit">
                                                {appointment.type}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date - Integrated into flex layout */}
                                    {appointment.date && (
                                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                                            <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Scheduled Date</span>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                                                <Calendar className="h-3.5 w-3.5 text-primary opacity-50" />
                                                <span>{appointment.date}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Time Badge - Always Visible */}
                                    <div className="flex items-center gap-2 text-xs md:text-base font-black text-primary bg-primary/10 px-3 md:px-6 py-2 md:py-3 border border-primary/30 tabular-nums italic shadow-[0_0_20px_rgba(var(--primary),0.1)] shrink-0">
                                        <motion.div
                                            animate={{ rotate: [0, 10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Clock className="h-3.5 w-3.5 md:h-5 md:w-5" strokeWidth={3} />
                                        </motion.div>
                                        <span>{appointment.time}</span>
                                    </div>
                                </div>

                                {/* Architectural Bottom Glow Line */}
                                <div className="absolute bottom-0 left-0 w-full flex scale-x-0 group-hover/item:scale-x-100 transition-transform duration-700 origin-right">
                                    <div className="h-[2px] w-full bg-primary" />
                                </div>
                            </motion.div>
                        ))}

                        {displayAppointments.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/5 bg-white/[0.01] animate-in fade-in zoom-in duration-1000">
                                <Calendar className="h-20 w-20 text-blue-900/20 mb-6" />
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-30 italic">No scheduled operations detected</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Bottom Professional "Power Line" */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="absolute bottom-0 left-0 flex opacity-30 group-hover:opacity-100 transition-opacity duration-1000"
                    >
                        <div className="h-[3px] w-1/4 bg-primary shadow-[0_0_20px_rgba(var(--primary),0.6)]" />
                        <div className="h-[3px] flex-1 bg-white/5" />
                    </motion.div>

                    {/* Top Shine */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            </Card>
        </motion.div>
    );
}
