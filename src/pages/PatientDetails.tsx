import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { contactsApi } from "@/lib/api";
import {
    Phone, Calendar, Stethoscope, FileText, Activity, AlertTriangle, Droplet,
    ArrowRight, MessageCircle, Clock, Pill, StickyNote, Loader2, Printer, ChevronDown
} from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface PatientDetailsProps {
    patient: any;
    onBack: () => void;
    onOpenChat: (phone: string, name: string) => void;
    onBookAppointment: (phone: string, name: string) => void;
}

export const PatientDetails = ({ patient: initialPatient, onBack, onOpenChat, onBookAppointment }: PatientDetailsProps) => {
    const [patient, setPatient] = useState<any>(initialPatient);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'diagnosis' | 'treatment'>('all');
    const [expandedCards, setExpandedCards] = useState<number[]>([]);

    const toggleCard = (id: number) => {
        setExpandedCards(prev => prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]);
    };

    useEffect(() => {
        const fetchPatientDetails = async () => {
            if (initialPatient?.id) {
                try {
                    const data = await contactsApi.getById(initialPatient.id);
                    setPatient(data);
                } catch (error) {
                    console.error("Failed to fetch patient details", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchPatientDetails();
    }, [initialPatient?.id]);

    if (!patient) return null;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>السجل الطبي - ${patient.name}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; line-height: 1.6; background: #fff; color: #333; }
                    .header { text-align: center; border-bottom: 3px solid #1E3A8A; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { font-size: 28px; color: #1E3A8A; margin-bottom: 5px; }
                    .header p { color: #666; font-size: 14px; }
                    .patient-info, .medical-profile { background: #F8FAFC; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #E2E8F0; }
                    .patient-info h2, .medical-profile h3, .visits h3 { font-size: 20px; margin-bottom: 15px; color: #1E3A8A; border-bottom: 2px solid #DBEAFE; padding-bottom: 10px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                    .info-row { display: flex; gap: 10px; }
                    .info-label { font-weight: bold; color: #64748B; width: 120px; }
                    .medical-item { margin-bottom: 15px; }
                    .medical-item h4 { color: #EA580C; margin-bottom: 5px; font-size: 16px; }
                    .medical-item p { background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #E2E8F0; }
                    .visit-card { border: 2px solid #E2E8F0; padding: 20px; margin-bottom: 20px; border-radius: 12px; page-break-inside: avoid; background: #fff; }
                    .visit-header { display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #F1F5F9; }
                    .visit-date { font-weight: bold; font-size: 16px; color: #0F172A; }
                    .visit-status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                    .status-completed { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
                    .status-cancelled { background: #FEE2E2; color: #991B1B; border: 1px solid #FECACA; }
                    .status-scheduled { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
                    .visit-section { margin-bottom: 15px; }
                    .visit-section h5 { color: #2563EB; margin-bottom: 5px; font-size: 14px; }
                    .visit-section p { background: #F8FAFC; padding: 10px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; }
                    .footer { margin-top: 40px; text-align: center; color: #94A3B8; font-size: 12px; border-top: 1px solid #E2E8F0; padding-top: 20px; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>السجل الطبي الشامل</h1>
                    <p>تاريخ الطباعة: ${format(new Date(), 'dd MMMM yyyy - hh:mm a', { locale: ar })}</p>
                </div>

                <div class="patient-info">
                    <h2>معلومات المريض</h2>
                    <div class="info-grid">
                        <div class="info-row"><span class="info-label">الاسم:</span><span>${patient.name}</span></div>
                        <div class="info-row"><span class="info-label">رقم الملف:</span><span>#${patient.id}</span></div>
                        <div class="info-row"><span class="info-label">رقم الهاتف:</span><span dir="ltr">${patient.phone}</span></div>
                        <div class="info-row"><span class="info-label">فصيلة الدم:</span><span>${patient.blood_type || 'غير محدد'}</span></div>
                    </div>
                </div>

                <div class="medical-profile">
                    <h3>الملف الطبي</h3>
                    <div class="medical-item">
                        <h4>⚠️ الحساسية</h4>
                        <p>${patient.allergies || 'لا توجد حساسية مسجلة'}</p>
                    </div>
                    <div class="medical-item">
                        <h4>🩺 الأمراض المزمنة</h4>
                        <p>${patient.chronic_diseases || 'لا توجد أمراض مزمنة مسجلة'}</p>
                    </div>
                </div>

                <div class="visits">
                    <h3>سجل الزيارات والتشخيصات (${filteredAppointments?.length || 0} زيارة)</h3>
                    ${filteredAppointments?.map((apt: any) => `
                        <div class="visit-card">
                            <div class="visit-header">
                                <div>
                                    <div class="visit-date">${format(new Date(apt.appointmentDate), 'EEEE, dd MMMM yyyy', { locale: ar })}</div>
                                    <div style="font-size: 12px; color: #64748B; margin-top: 5px;">⌚ ${format(new Date(apt.appointmentDate), 'hh:mm a', { locale: ar })}</div>
                                </div>
                                <span class="visit-status status-${apt.status === 'completed' ? 'completed' : apt.status === 'cancelled' ? 'cancelled' : 'scheduled'}">
                                    ${apt.status === 'completed' ? 'مكتمل' : apt.status === 'cancelled' ? 'ملغي' : 'مجدول'}
                                </span>
                            </div>
                            ${apt.notes ? `<div class="visit-section"><h5>📝 ملاحظات الزيارة</h5><p>${apt.notes}</p></div>` : ''}
                            ${apt.medicalRecords?.[0] ? `
                                <div class="visit-section"><h5>🔬 التشخيص الطبي</h5><p>${apt.medicalRecords[0].diagnosis || 'غير محدد'}</p></div>
                                ${apt.medicalRecords[0].treatment ? `<div class="visit-section"><h5>💊 الخطة العلاجية</h5><p>${apt.medicalRecords[0].treatment}</p></div>` : ''}
                            ` : '<p style="color: #94A3B8; font-style: italic; font-size: 13px;">لم يتم تسجيل بيانات طبية مفصلة لهذه الزيارة.</p>'}
                        </div>
                    `).join('')}
                </div>
                <div class="footer"><p>هذا المستند تم إنشاؤه عبر نظام دكتور جو لإدارة العيادات</p></div>
                <script>window.onload = function() { window.print(); };</script>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const lastVisitDate = patient.appointment && patient.appointment.length > 0
        ? patient.appointment[0].appointmentDate
        : null;

    const stats = [
        { label: 'إجمالي الزيارات', value: patient.appointment?.length || 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
        { label: 'آخر زيارة', value: lastVisitDate ? format(new Date(lastVisitDate), 'dd MMM yyyy', { locale: ar }) : '-', icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
        { label: 'فصيلة الدم', value: patient.blood_type || 'غير محدد', icon: Droplet, color: "text-red-500", bg: "bg-red-50" },
    ];

    const filteredAppointments = patient.appointment?.filter((apt: any) => {
        if (filter === 'all') return true;
        if (filter === 'diagnosis') return !!apt.medicalRecords?.[0]?.diagnosis;
        if (filter === 'treatment') return !!apt.medicalRecords?.[0]?.treatment;
        return true;
    }) || [];

    return (
        <div className="space-y-4 pb-12 max-w-5xl mx-auto font-display" dir="rtl">
            {/* Ultra-Premium Hero Header */}
            <div className="relative mb-2">
                <HeroSection
                    doctorName={patient.name}
                    pageTitle="ملف المريض الطبي"
                    description={`رقم الملف: #${patient.id} - ${patient.phone}`}
                    icon={FileText}
                    className="mb-0 border-none rounded-xl overflow-hidden shadow-sm"
                >
                    <div className="flex gap-2 items-center">
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="h-9 px-4 gap-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm font-bold text-xs"
                            title="العودة"
                        >
                            <ArrowRight className="h-4 w-4" />
                            <span className="hidden sm:inline">العودة</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg backdrop-blur-sm hidden sm:flex"
                            onClick={() => onOpenChat(patient.phone, patient.name)}
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            واتساب
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg backdrop-blur-sm"
                            onClick={handlePrint}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            طباعة السجل
                        </Button>
                    </div>
                </HeroSection>
            </div>

            {/* Unified Medical Summary Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Card className="border-2 border-orange-500/60 rounded-xl bg-white shadow-sm overflow-hidden">
                    {/* Stats Row (Top) */}
                    <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-200/60 border-b border-slate-100 bg-slate-50 relative">
                        {/* Subtle inner highlight */}
                        <div className="absolute inset-x-0 top-0 h-px bg-white/60" />
                        
                        {stats.map((stat, i) => (
                            <div key={i} className="flex flex-col items-center justify-center text-center py-4 px-2 hover:bg-slate-100/50 transition-colors">
                                <stat.icon className={`h-6 w-6 mb-2 ${stat.color}`} strokeWidth={2.5} />
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-none mb-1.5 tracking-tight">
                                    {loading && i === 0 ? <Loader2 className="h-4 w-4 animate-spin text-blue-600 inline" /> : stat.value}
                                </h3>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Medical History Row (Bottom) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5">
                        <div className="bg-gradient-to-br from-orange-50/80 to-white p-4 rounded-xl border border-orange-100/80 shadow-sm relative overflow-hidden group">
                            <div className="absolute -left-4 -top-4 w-16 h-16 bg-orange-400/5 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                            <div className="flex items-center gap-3 mb-2.5 relative z-10">
                                <div className="p-2 rounded-lg bg-orange-100 text-orange-600 shadow-sm border border-orange-200/50">
                                    <AlertTriangle className="h-4 w-4" />
                                </div>
                                <h3 className="font-bold text-sm text-orange-900">الحساسية والموانع</h3>
                            </div>
                            <p className="text-orange-900/80 font-medium text-xs sm:text-sm leading-relaxed relative z-10">
                                {patient.allergies || 'لا توجد بيانات عن أية حساسية حالياً.'}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50/80 to-white p-4 rounded-xl border border-blue-100/80 shadow-sm relative overflow-hidden group">
                            <div className="absolute -left-4 -top-4 w-16 h-16 bg-blue-400/5 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                            <div className="flex items-center gap-3 mb-2.5 relative z-10">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shadow-sm border border-blue-200/50">
                                    <Activity className="h-4 w-4" />
                                </div>
                                <h3 className="font-bold text-sm text-blue-900">التاريخ المرضي المزمن</h3>
                            </div>
                            <p className="text-blue-900/80 font-medium text-xs sm:text-sm leading-relaxed relative z-10">
                                {patient.chronic_diseases || 'لا توجد أمراض مزمنة مسجلة في ملف المريض.'}
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Timeline Section */}
            <div>
                <Card className="p-5 sm:p-7 border border-slate-200/80 bg-white shadow-sm rounded-2xl min-h-[400px] relative overflow-hidden">
                        
                        {/* Glowing Background gradient */}
                        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-bl from-blue-400/10 to-orange-400/5 blur-[100px] -z-10 pointer-events-none" />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">سجل الزيارات</h3>
                                </div>
                            </div>

                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                {[
                                    { id: 'all', label: 'الكل' },
                                    { id: 'diagnosis', label: 'التشخيص' },
                                    { id: 'treatment', label: 'العلاج' }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setFilter(t.id as any)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex-1 sm:flex-none ${filter === t.id
                                            ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-blue-600">
                                <Loader2 className="h-8 w-8 animate-spin mb-3" />
                                <p className="font-bold text-sm text-slate-500 animate-pulse">جاري تحميل السجل الطبي...</p>
                            </div>
                        ) : filteredAppointments.length > 0 ? (
                            <div className="relative border-r-[2px] border-slate-200 mr-2 pr-4 sm:pr-6 pb-2 space-y-6 z-10">
                                <AnimatePresence>
                                    {filteredAppointments.map((apt: any, idx: number) => {
                                        const isCompleted = apt.status === 'completed';
                                        const isCancelled = apt.status === 'cancelled';
                                        const isExpanded = expandedCards.includes(apt.id);
                                        
                                        const statusColors = isCompleted 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : isCancelled 
                                                ? 'bg-red-50 text-red-700 border-red-200' 
                                                : 'bg-orange-50 text-orange-700 border-orange-200';
                                                
                                        const dotColor = isCompleted ? 'bg-green-500' : isCancelled ? 'bg-red-500' : 'bg-orange-500';

                                        return (
                                            <motion.div
                                                key={apt.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="relative group block"
                                            >
                                                {/* Animated Timeline Dot */}
                                                <div className={`absolute -right-[21px] sm:-right-[35px] top-6 h-5 w-5 rounded-full border-[3px] border-white shadow-sm flex items-center justify-center z-10 transition-transform ${dotColor}`}>
                                                </div>

                                                {/* Visit Card - Accordion Header */}
                                                <div 
                                                    className={`bg-white border-[1.5px] border-orange-400/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden`}
                                                >
                                                    <div 
                                                        className="flex flex-wrap items-center justify-between gap-2 p-4 sm:p-5 cursor-pointer hover:bg-orange-50/20"
                                                        onClick={() => toggleCard(apt.id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg bg-orange-100 text-orange-600`}>
                                                                <Calendar className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                                                                    {format(new Date(apt.appointmentDate), 'EEEE، d MMMM yyyy', { locale: ar })}
                                                                </h4>
                                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1 font-medium">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    {format(new Date(apt.appointmentDate), 'hh:mm a', { locale: ar })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold border ${statusColors}`}>
                                                                {isCompleted ? 'مكتمل' : isCancelled ? 'ملغي' : 'مجدول'}
                                                            </span>
                                                            <motion.div
                                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="p-1 rounded-full bg-slate-100 text-slate-500"
                                                            >
                                                                <ChevronDown className="h-4 w-4" />
                                                            </motion.div>
                                                        </div>
                                                    </div>

                                                    {/* Expandable Content Container */}
                                                    <AnimatePresence initial={false}>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="border-t border-orange-100 bg-slate-50/50"
                                                            >
                                                                <div className="p-4 sm:p-5 space-y-3">
                                                        {apt.notes && (
                                                            <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                    <StickyNote className="h-3.5 w-3.5 text-orange-600" />
                                                                    <span className="font-bold text-xs text-orange-900">ملاحظات الزيارة</span>
                                                                </div>
                                                                <p className="text-orange-900 text-xs font-medium leading-relaxed">{apt.notes}</p>
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {(!filter || filter === 'all' || filter === 'diagnosis') && (
                                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                                                                    <div className="flex items-center gap-2 mb-1.5">
                                                                        <Activity className="h-3.5 w-3.5 text-blue-600" />
                                                                        <span className="font-bold text-xs text-blue-900">التشخيص</span>
                                                                    </div>
                                                                    <p className="text-slate-700 text-xs font-medium leading-relaxed bg-white p-2 rounded-md border border-slate-100">
                                                                        {apt.medicalRecords?.[0]?.diagnosis ? apt.medicalRecords[0].diagnosis : <span className="opacity-60 italic">لا يوجد تشخيص</span>}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {(!filter || filter === 'all' || filter === 'treatment') && (
                                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-emerald-200 transition-colors">
                                                                    <div className="flex items-center gap-2 mb-1.5">
                                                                        <Pill className="h-3.5 w-3.5 text-emerald-600" />
                                                                        <span className="font-bold text-xs text-emerald-900">العلاج والدواء</span>
                                                                    </div>
                                                                    <p className="text-slate-700 text-xs font-medium leading-relaxed bg-white p-2 rounded-md border border-slate-100">
                                                                        {apt.medicalRecords?.[0]?.treatment ? apt.medicalRecords[0].treatment : <span className="opacity-60 italic">لا يوجد دواء مسجل</span>}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-1">لا توجد سجلات طبية</h4>
                                <p className="text-slate-500 font-medium text-sm">
                                    السجل الطبي للمريض فارغ حالياً.
                                </p>
                            </div>
                        )}
                    </Card>
            </div>
        </div>
    );
};
