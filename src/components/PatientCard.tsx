import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, User, MessageCircle, Copy, Calendar, Eye, Trash2 } from "lucide-react";
import { toastWithSound } from '@/lib/toast-with-sound';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface PatientCardProps {
    id: string;
    name: string;
    phone?: string;
    last_visit?: string;
    onDelete: (id: string) => void;
    onOpenChat?: (phone: string, name?: string) => void;
    onViewDetails: () => void;
    total_appointments?: number;
    blood_type?: string;
}

export const PatientCard = ({
    id, name, phone,
    last_visit,
    total_appointments,
    onDelete, onOpenChat, onViewDetails
}: PatientCardProps) => {
    const hasPhone = phone && phone.length > 3;

    const copyToClipboard = () => {
        if (hasPhone) {
            navigator.clipboard.writeText(phone);
            toastWithSound.success("نسخ");
        }
    };

    return (
        <div className="px-3">
            <Card className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group p-3 flex flex-col gap-2">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10"></div>
                <div className="flex flex-col gap-2 h-full relative z-20">
                    {/* Header: Icon + Name + Delete */}
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-blue-50 group-hover:bg-blue-600 transition-colors border border-blue-100 group-hover:border-blue-600 shadow-sm flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-sm text-slate-900 truncate leading-tight">{name || 'مريض جديد'}</h4>
                            {total_appointments !== undefined && total_appointments > 0 && (
                                <span className="text-[10px] text-slate-500 font-bold block">
                                    {total_appointments} زيارات
                                </span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 -ml-1 transition-all rounded-sm"
                            onClick={() => onDelete(id)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* Phone Row */}
                    {hasPhone ? (
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-slate-50 border border-slate-100">
                            <Phone className="h-3 w-3 text-blue-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-700 flex-1 truncate" dir="ltr">{phone?.replace(/@.*/, '')}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-blue-600 rounded-sm" onClick={copyToClipboard}>
                                <Copy className="h-2.5 w-2.5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="text-[10px] font-bold text-slate-400 text-center py-1 bg-slate-50 rounded-md">
                            لا يوجد رقم
                        </div>
                    )}

                    {/* Date Row */}
                    {last_visit && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 px-1">
                            <Calendar className="h-3 w-3 text-orange-500" />
                            <span>آخر زيارة: {format(new Date(last_visit), 'dd/MM/yyyy', { locale: ar })}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100">
                        {hasPhone && (
                            <Button
                                variant="outline"
                                className="flex-1 gap-1.5 h-7 text-[10px] font-bold rounded-sm border-blue-200 hover:bg-blue-50 hover:text-blue-700 text-blue-600"
                                onClick={() => {
                                    if (onOpenChat) onOpenChat(phone, name);
                                    else window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
                                }}
                            >
                                <MessageCircle className="h-3 w-3" />
                                محادثة
                            </Button >
                        )}

                        <Button
                            variant="default"
                            className="flex-1 gap-1.5 h-7 text-[10px] font-bold rounded-sm bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={onViewDetails}
                        >
                            <Eye className="h-3 w-3" />
                            تفاصيل
                        </Button>
                    </div>
                </div>
            </Card >
        </div>
    );
};
