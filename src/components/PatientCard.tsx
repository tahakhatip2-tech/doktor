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
            <Card className="p-3 transition-all duration-300 border border-white/10 bg-blue-950/5 backdrop-blur-2xl rounded-none shadow-sm hover:shadow-md relative overflow-hidden group flex flex-col gap-2">
                <div className="flex flex-col gap-2 h-full">
                    {/* Header: Icon + Name + Delete */}
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-sm bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-foreground truncate leading-tight">{name || 'مرظٹض جدظٹد'}</h4>
                            {total_appointments !== undefined && total_appointments > 0 && (
                                <span className="text-[10px] text-muted-foreground font-medium block">
                                    {total_appointments} زظٹاراطھ
                                </span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 -ml-1 transition-all rounded-sm"
                            onClick={() => onDelete(id)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* Phone Row */}
                    {hasPhone ? (
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm bg-white/30 dark:bg-white/5 border border-white/10">
                            <Phone className="h-3 w-3 text-primary/70 shrink-0" />
                            <span className="text-xs font-bold text-foreground/80 flex-1 truncate" dir="ltr">{phone?.replace(/@.*/, '')}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-primary rounded-sm" onClick={copyToClipboard}>
                                <Copy className="h-2.5 w-2.5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="text-[10px] text-muted-foreground text-center py-1 bg-muted/20 rounded-sm">
                            لا ظٹظˆجد رقم
                        </div>
                    )}

                    {/* Date Row */}
                    {last_visit && (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-1">
                            <Calendar className="h-3 w-3 opacity-70" />
                            <span>آخر زظٹارة: {format(new Date(last_visit), 'dd/MM/yyyy', { locale: ar })}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-2 border-t border-white/10">
                        {hasPhone && (
                            <Button
                                variant="outline"
                                className="flex-1 gap-1.5 h-7 text-[10px] font-bold rounded-sm border-primary/20 hover:bg-primary/5 hover:text-primary"
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
                            variant="outline"
                            className="flex-1 gap-1.5 h-7 text-[10px] font-bold rounded-sm border-primary/20 text-primary hover:bg-primary hover:text-white"
                            onClick={onViewDetails}
                        >
                            <Eye className="h-3 w-3" />
                            طھظپاصظٹل
                        </Button>
                    </div>
                </div>
            </Card >
        </div>
    );
};
