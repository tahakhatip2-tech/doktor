import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Briefcase, MessageSquare, Trash2, User, ChevronRight, ChevronLeft, Clock, Target, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toastWithSound } from '@/lib/toast-with-sound';

interface CRMCardProps {
    contact: any;
    onDelete?: (id: string) => void;
    onUpdateStatus?: (id: string, newStatus: string) => void;
    onOpenChat?: (phone: string, name?: string) => void;
}

const STATUS_OPTS = [
    { id: 'new', label: 'جدظٹد', color: '#3b82f6', icon: Clock },
    { id: 'interested', label: 'مهتم', color: '#eab308', icon: Target },
    { id: 'customer', label: 'زبظˆن', color: '#22c55e', icon: CheckCircle },
    { id: 'junk', label: 'مهمل', color: '#ef4444', icon: XCircle },
];

export function CRMCard({ contact, onDelete, onUpdateStatus, onOpenChat }: CRMCardProps) {
    const handleWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onOpenChat) {
            onOpenChat(contact.phone, contact.name);
        } else {
            let phone = contact.phone.replace(/\D/g, '');
            if (phone.startsWith('0')) phone = '962' + phone.substring(1);
            if (!phone.startsWith('962') && phone.length === 9) phone = '962' + phone;
            window.open(`https://wa.me/${phone}`, '_blank');
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) onDelete(contact.id.toString());
    };

    return (
        <div className="group relative">
            <Card
                className={cn(
                    "relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl group-hover:translate-y-[-2px] transition-all duration-300 overflow-hidden p-3 flex flex-col mb-3 z-20"
                )}
            >
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10"></div>
                
                <div className="relative z-20 flex flex-col h-full">
                    {/* Platform Badge */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                            <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[140px]">
                                {(!contact.name || contact.name.toLowerCase() === 'unknown' || contact.name === 'غير معروف') ? 'عميل جديد' : contact.name}
                            </h4>
                        </div>
                        {contact.platform && contact.platform.toLowerCase() !== 'unknown' && contact.platform.toLowerCase() !== 'manual import' && (
                            <Badge
                                className={cn(
                                    "text-[9px] px-1.5 py-0 h-4 border-none font-bold uppercase",
                                    getPlatformColor(contact.platform),
                                    "bg-blue-50 text-blue-600"
                                )}
                            >
                                {contact.platform}
                            </Badge>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="space-y-2">
                        <div
                            className="flex items-center justify-between bg-slate-50 p-2 rounded-md border border-slate-100 group/phone cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(contact.phone);
                                toastWithSound.success("تم نسخ الرقم بنجاح");
                            }}
                            title="اضغط لنسخ الرقم"
                        >
                            <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-blue-500" />
                                <span dir="ltr" className="font-bold text-sm tracking-tight text-slate-700">{contact.phone}</span>
                            </div>
                            <Badge variant="outline" className="h-4 px-1 text-[8px] opacity-0 group-hover/phone:opacity-100 transition-opacity bg-white border-blue-200 text-blue-600">نسخ</Badge>
                        </div>

                        {contact.job_title && (
                            <div className="flex items-center gap-2 px-1 text-[11px] font-bold text-slate-500">
                                <Briefcase className="h-3 w-3 text-orange-400" />
                                <span className="truncate">{contact.job_title}</span>
                            </div>
                        )}

                        {contact.location && (
                            <div className="flex items-center gap-2 px-1 text-[11px] font-bold text-slate-500">
                                <MapPin className="h-3 w-3 text-red-400" />
                                <span className="truncate">{contact.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Status Switcher - Showing all with highlight */}
                    <div className="mt-auto pt-3 border-t border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 mb-2 text-right">الحالة الحالية وتحويلها:</p>
                        <div className="flex flex-wrap gap-1">
                            {STATUS_OPTS.map(s => (
                                <Button
                                    key={s.id}
                                    variant={contact.status === s.id ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "h-7 px-2 flex-1 min-w-[60px] text-[9px] font-bold gap-1 transition-all duration-300",
                                        contact.status === s.id ? "shadow-md scale-[1.05] bg-orange-500 text-white hover:bg-orange-600 border-none" : "hover:bg-slate-50 border-slate-200 text-slate-500"
                                    )}
                                    onClick={() => onUpdateStatus?.(contact.id.toString(), s.id)}
                                >
                                    <s.icon className={cn("h-3 w-3", contact.status === s.id ? "text-white" : "")} style={contact.status !== s.id ? { color: s.color } : {}} />
                                    {s.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons - Always Visible */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex gap-1.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 shadow-sm border border-green-200"
                                onClick={handleWhatsApp}
                                title="مراسلة عبر واتساب"
                            >
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 shadow-sm border border-red-200"
                                onClick={handleDelete}
                                title="حذف العميل"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-slate-400">تاريخ الإضافة</span>
                            <span className="text-[9px] italic font-bold text-slate-600">
                                {contact.created_at ? new Date(contact.created_at).toLocaleDateString('ar-EG') : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'new': return '#3b82f6';
        case 'interested': return '#eab308';
        case 'customer': return '#1d4ed8';
        case 'junk': return '#ef4444';
        default: return '#9ca3af';
    }
}

function getPlatformColor(platform: string = '') {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return 'bg-blue-600 text-white shadow-blue-500/20';
    if (p.includes('whatsapp')) return 'bg-primary text-white shadow-primary/20';
    if (p.includes('google')) return 'bg-emerald-600 text-white shadow-emerald-500/20';
    if (p.includes('instagram')) return 'bg-pink-600 text-white shadow-pink-500/20';
    return 'bg-secondary text-secondary-foreground';
}
