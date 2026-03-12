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
            <Card className="p-4 md:p-6 relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10"></div>
                
                <div className="relative z-20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4 sm:gap-0">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 shadow-sm transition-colors">
                                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-none mb-1">المواعيد القادمة</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">مواعيد اليوم والغد</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onViewAll}
                            className="h-8 md:h-9 px-4 font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200 self-end sm:self-auto"
                        >
                            عرض الكل
                            <ChevronLeft className="h-4 w-4 mr-1" />
                        </Button>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3"
                    >
                        {displayAppointments.map((appointment) => (
                            <motion.div
                                key={appointment.id}
                                variants={itemVariants}
                                whileHover={{ scale: 1.01 }}
                                className="group/item flex flex-col md:flex-row items-start md:items-center gap-4 p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-md hover:border-blue-300 transition-all duration-300 cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-1 h-full bg-slate-200 group-hover/item:bg-blue-500 transition-colors"></div>

                                {/* Mobile Layout */}
                                <div className="w-full flex md:hidden flex-col gap-3 pr-2">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="h-10 w-10 bg-white border border-slate-200 rounded-md flex items-center justify-center shrink-0 shadow-sm">
                                            <User className="h-5 w-5 text-slate-500 group-hover/item:text-blue-500 transition-colors" strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-extrabold text-sm text-slate-900 truncate leading-none">
                                                    {appointment.patientName}
                                                </p>
                                                <div className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-sm shrink-0">
                                                    {appointment.type}
                                                </div>
                                            </div>
                                            {appointment.date && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                                    <Calendar className="h-3 w-3 text-orange-400" />
                                                    <span>{appointment.date}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-700 bg-white py-2 border border-slate-200 rounded-md shadow-sm">
                                        <Clock className="h-3.5 w-3.5 text-blue-500" strokeWidth={3} />
                                        <span>{appointment.time}</span>
                                    </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden md:flex w-full items-center justify-between gap-4 pr-3">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="h-12 w-12 bg-white border border-slate-200 rounded-md flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover/item:scale-105">
                                            <User className="h-6 w-6 text-slate-500 group-hover/item:text-blue-500 transition-colors" strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <p className="font-extrabold text-lg text-slate-900 truncate block">
                                                {appointment.patientName}
                                            </p>
                                            <div className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-sm inline-block w-fit">
                                                {appointment.type}
                                            </div>
                                        </div>
                                    </div>

                                    {appointment.date && (
                                        <div className="flex flex-col items-end gap-1 shrink-0 px-4">
                                            <span className="text-[10px] font-bold text-slate-400">تاريخ الموعد</span>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                <Calendar className="h-3.5 w-3.5 text-orange-400" />
                                                <span>{appointment.date}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm font-black text-slate-800 bg-white px-4 py-2 border border-slate-200 rounded-md shadow-sm shrink-0">
                                        <Clock className="h-4 w-4 text-blue-500" strokeWidth={3} />
                                        <span>{appointment.time}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {displayAppointments.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-200 bg-slate-50 rounded-md">
                                <Calendar className="h-16 w-16 text-slate-300 mb-4" />
                                <p className="text-sm font-bold text-slate-500">لا توجد مواعيد قادمة مجدولة</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </Card>
        </motion.div>
    );
}
