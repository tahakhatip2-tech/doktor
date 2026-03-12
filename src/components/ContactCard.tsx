import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, User, MessageCircle, Copy, CheckCircle, Clock, Star, Trash2, MoreHorizontal, ExternalLink, Facebook, Users } from "lucide-react";
import { toastWithSound } from '@/lib/toast-with-sound';
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTemplates } from "@/hooks/useTemplates";

interface ContactCardProps {
  id: string;
  name: string;
  phone?: string;
  source: string;
  platform: string;
  extractedFrom: string;
  status?: string;
  email?: string;
  job_title?: string;
  location?: string;
  profile_url?: string;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onOpenChat?: (phone: string, name?: string) => void;
}

export const ContactCard = ({ id, name, phone, source, platform, extractedFrom, status = 'new', email, job_title, location, profile_url, onDelete, onUpdateStatus, onOpenChat }: ContactCardProps) => {
  const { templates } = useTemplates();
  const hasPhone = phone && phone.length > 3;

  const copyToClipboard = () => {
    if (hasPhone) {
      navigator.clipboard.writeText(phone);
      toastWithSound.success("تم نسخ رقم الهاتف");
    }
  };

  const statusConfig: any = {
    new: { label: 'جديد', color: 'bg-blue-500/10 text-blue-500', icon: Clock },
    contacted: { label: 'تم التواصل', color: 'bg-amber-500/10 text-amber-500', icon: MessageCircle },
    interested: { label: 'مهتم جداً', color: 'bg-primary/10 text-primary', icon: Star },
  };

  return (
    <Card className="relative rounded-md border border-orange-500 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col min-h-[320px] p-5" dir="rtl">
      {/* Platform background accent */}
      <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-blue-600 to-orange-500 z-10" />

      <div className="flex items-start justify-between mb-4 relative z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-600 transition-colors border border-blue-100 group-hover:border-blue-600 shadow-sm flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 leading-none mb-1">{name || 'عميل محتمل'}</h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] py-0 h-4 border-orange-200 text-orange-600 font-bold bg-orange-50">
                {platform}
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4 p-3 rounded-md bg-slate-50 border border-slate-100 relative z-20">
        <Phone className="h-4 w-4 text-blue-500" />
        {hasPhone ? (
          <>
            <span className="font-mono font-bold flex-1 text-right text-sm text-slate-700" dir="ltr">{phone}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-blue-600 hover:bg-blue-50" onClick={copyToClipboard}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <span className="flex-1 text-center text-sm font-bold text-slate-400">لا يوجد رقم هاتف</span>
        )}
      </div>

      {/* CRM Status Toggle */}
      <div className="flex bg-slate-50 p-1 rounded-md border border-slate-100 gap-1 mb-4 relative z-20">
        {Object.keys(statusConfig).map((s) => (
          <button
            key={s}
            onClick={() => onUpdateStatus(id, s)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold transition-all",
              status === s
                ? "bg-white text-slate-900 shadow-sm border border-slate-200 scale-[1.02]"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            )}
          >
            {s === 'new' && <Clock className={cn("h-3 w-3", status === s ? "text-blue-500" : "")} />}
            {s === 'contacted' && <MessageCircle className={cn("h-3 w-3", status === s ? "text-amber-500" : "")} />}
            {s === 'interested' && <Star className={cn("h-3 w-3", status === s ? "text-orange-500" : "")} />}
            {statusConfig[s].label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-3 relative z-20">
        {hasPhone && (
          <div className="flex flex-1 gap-0.5">
            <Button
              className="flex-1 gap-2 bg-green-500 hover:bg-green-600 text-white font-bold h-9 rounded-l-none"
              size="sm"
              onClick={() => {
                if (onOpenChat) {
                  onOpenChat(phone, name);
                } else {
                  window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
                }
              }}
            >
              <MessageCircle className="h-4 w-4 flex-shrink-0" />
              واتساب
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button className="w-8 shrink-0 bg-green-600 hover:bg-green-700 text-white h-9 p-0 rounded-r-none border-l border-white/20" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 bg-white border-slate-200 shadow-xl" align="end" dir="rtl">
                <p className="text-xs font-bold px-2 mb-2 text-slate-500 text-right">اختر رسالة جاهزة</p>
                <div className="space-y-1">
                  {templates.map(t => (
                    <Button key={t.id} variant="ghost" size="sm" className="w-full justify-start text-right font-normal h-auto py-2 hover:bg-slate-50" onClick={() => {
                      const text = encodeURIComponent(t.response);
                      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${text}`, '_blank')
                    }}>
                      <div className="flex flex-col items-start gap-1 w-full">
                        <span className="font-extrabold text-blue-600 text-xs">{t.trigger}</span>
                        <span className="text-[10px] text-slate-500 font-medium line-clamp-2 w-full text-right">{t.response}</span>
                      </div>
                    </Button>
                  ))}
                  {templates.length === 0 && (
                    <p className="text-[10px] text-center font-bold text-slate-400 py-2">لا توجد قوالب محفوظة</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
        {hasPhone && (
          <Button
            variant="outline"
            className="flex-1 gap-2 border-blue-200 hover:bg-blue-50 text-blue-600 font-bold h-9"
            size="sm"
            onClick={() => window.location.href = `tel:${phone}`}
          >
            <Phone className="h-4 w-4" />
            اتصال
          </Button>
        )}
        {profile_url && (
          <Button
            variant="outline"
            className={cn(
              "gap-2 border-blue-200 hover:bg-blue-50 h-9 font-bold text-blue-600",
              hasPhone ? "w-1/4 px-0" : "w-full"
            )}
            size="sm"
            onClick={() => window.open(profile_url, '_blank')}
            title="افتح البروفايل وأرسل رسالة من هناك"
          >
            <Facebook className="h-4 w-4 text-blue-600 fill-blue-600/10 shrink-0" />
            {hasPhone ? "" : "فتح الفيسبوك للمراسلة"}
          </Button>
        )}
      </div>

      {/* Enriched Data Section */}
      {(email || job_title || location) && (
        <div className="mb-4 pt-3 border-t border-slate-100 space-y-2 relative z-20">
          {email && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span className="font-bold w-12 text-slate-700">البريد:</span>
              <span className="truncate font-medium">{email}</span>
            </div>
          )}
          {job_title && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span className="font-bold w-12 text-slate-700">الوظيفة:</span>
              <span className="truncate font-medium">{job_title}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span className="font-bold w-12 text-slate-700">الموقع:</span>
              <span className="truncate font-medium">{location}</span>
            </div>
          )}
        </div>
      )}

      <div className="text-[10px] text-slate-400 font-medium flex justify-between items-center opacity-80 italic border-t border-slate-100 pt-2 mt-auto text-right relative z-20">
        <span>مستخرج من: <span className="text-orange-500 not-italic font-bold">{source}</span> {extractedFrom && `— ${extractedFrom}`}</span>
      </div>
    </Card>
  );
};
