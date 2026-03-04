import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { appointmentsApi, whatsappApi } from '@/lib/api';
import { toastWithSound } from '@/lib/toast-with-sound';
import { Calendar as CalendarIcon, Clock, User, Phone, FileText } from 'lucide-react';
import { appointmentSchema } from "@/lib/validations";

interface AddAppointmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    onOpenChat?: (phone: string) => void;
}

export default function AddAppointmentDialog({ open, onOpenChange, onSuccess, onOpenChat }: AddAppointmentDialogProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        phone: '',
        appointment_date: '',
        appointment_time: '',
        appointment_type: 'consultation',
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate with Zod
        const validation = appointmentSchema.safeParse({
            name: formData.customer_name,
            phone: formData.phone,
            appointment_date: formData.appointment_date,
            appointment_time: formData.appointment_time,
            notes: formData.notes
        });

        if (!validation.success) {
            toastWithSound.error(validation.error.errors[0].message);
            return;
        }

        setLoading(true);
        try {
            // Combine date and time
            const fullDateTime = `${formData.appointment_date}T${formData.appointment_time}:00`;

            await appointmentsApi.create({
                customerName: formData.customer_name,
                phone: formData.phone,
                appointmentDate: fullDateTime,
                appointmentType: formData.appointment_type,
                notes: formData.notes,
                status: 'scheduled'
            });

            toastWithSound.success('تم إضافة الموعد بنجاح');

            // Auto-send WhatsApp Message
            let whatsappJID = '';
            try {
                // Formatting date and time for the message
                const d = new Date(fullDateTime);
                const dateStr = d.toLocaleDateString('ar-JO');
                const timeStr = d.toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' });

                // Clean phone number: remove spaces, +, -, (, ), etc.
                const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
                // Add WhatsApp JID suffix
                whatsappJID = `${cleanPhone}@s.whatsapp.net`;
                console.log('[Appointment] Sending to JID:', whatsappJID);

                // Fetch clinic name for dynamic message
                let clinicName = 'عيادتنا'; // Default fallback
                try {
                    const settings = await whatsappApi.getSettings();
                    if (settings.clinic_name) clinicName = settings.clinic_name;
                    else if (settings.doctor_name) clinicName = `عيادة د. ${settings.doctor_name}`;
                } catch (e) {
                    console.warn('[Appointment] Failed to fetch settings, using default name');
                }

                await whatsappApi.send({
                    phone: whatsappJID,
                    message: `مرحباً ${formData.customer_name}،\n\nتم تأكيد حجز موعدك في ${clinicName}.\nالتاريخ: ${dateStr}\nالوقت: ${timeStr}\n\nنتمنى لكم السلامة والشفاء العاجل.`
                });

                toastWithSound.success('تم إرسال رسالة التأكيد عبر الواتساب');

            } catch (whatsappError: any) {
                console.error('[Appointment] WhatsApp error:', whatsappError);
                toastWithSound.error(`فشل إرسال واتساب: ${whatsappError?.message || 'خطأ خارجي'}`);
            }

            // Store the WhatsApp JID to open the same chat
            const phoneToOpen = whatsappJID || formData.phone;
            console.log('[Appointment] Will open chat for:', phoneToOpen);

            onSuccess();
            onOpenChange(false);
            setFormData({
                customer_name: '',
                phone: '',
                appointment_date: '',
                appointment_time: '',
                appointment_type: 'consultation',
                notes: '',
            });

            // Open Chat after dialog closes
            if (onOpenChat && phoneToOpen) {
                // Short delay to allow dialog close state to propagate
                const delay = 100;
                window.setTimeout(() => {
                    try {
                        onOpenChat(phoneToOpen);
                    } catch (err) {
                        console.error('[Appointment] Failed to open chat:', err);
                    }
                }, delay);
            }
        } catch (error: any) {
            console.error('Error creating appointment:', error);
            toastWithSound.error(error.message || 'فشل في إضافة الموعد التلقائي');
        } finally {
            setLoading(false);
        }
    };

    const AppointmentForm = (
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        اسم المريض
                    </Label>
                    <Input
                        placeholder="مثلاً: محمد أحمد"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        className="bg-background/50 border-border/50 h-10 md:h-11"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        رقم الهاتف
                    </Label>
                    <Input
                        placeholder="9627XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-background/50 border-border/50 h-10 md:h-11"
                        dir="ltr"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        تاريخ الموعد
                    </Label>
                    <Input
                        type="date"
                        value={formData.appointment_date}
                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                        className="bg-background/50 border-border/50 h-10 md:h-11"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        وقت الموعد
                    </Label>
                    <Input
                        type="time"
                        value={formData.appointment_time}
                        onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                        className="bg-background/50 border-border/50 h-10 md:h-11"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold">نوع الموعد</Label>
                <Select
                    value={formData.appointment_type}
                    onValueChange={(value) => setFormData({ ...formData, appointment_type: value })}
                >
                    <SelectTrigger className="bg-background/50 border-border/50 h-10 md:h-11">
                        <SelectValue placeholder="اختر نوع الموعد" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="consultation">استشارة شاملة</SelectItem>
                        <SelectItem value="checkup">فحص دوري</SelectItem>
                        <SelectItem value="followup">مراجعة نتائج وإجراءات</SelectItem>
                        <SelectItem value="emergency">حجز طارئ</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    ملاحظات إضافية
                </Label>
                <Textarea
                    placeholder="أي تفاصيل أخرى حول حالة المريض التي تتطلب الانتباه..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-background/50 border-border/50 min-h-[80px] md:min-h-[100px] resize-none"
                />
            </div>

            <div className="pt-2 md:pt-4 flex gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="h-10 md:h-12 flex-1 font-bold rounded-2xl"
                >
                    إلغاء إجراء الحجز
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="h-10 md:h-12 flex-[2] font-bold rounded-2xl transition-all duration-300"
                >
                    {loading ? "جاري الحفظ والجدولة..." : "تأكيد وإضافة الموعد"}
                </Button>
            </div>
        </form>
    );

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl overflow-hidden bg-card/95 backdrop-blur-xl">
                    <DialogHeader className="bg-primary/5 p-6 border-b border-primary/10">
                        <DialogTitle className="text-2xl font-display font-black flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/20 text-primary">
                                <CalendarIcon className="h-6 w-6" />
                            </div>
                            إضافة موعد جديد
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            قم بإدخال بيانات المريض وتفاصيل الحجز الجديد يدوياً.
                        </DialogDescription>
                    </DialogHeader>
                    {AppointmentForm}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-card/95 backdrop-blur-xl border-t border-primary/10">
                <DrawerHeader className="text-right">
                    <DrawerTitle className="text-xl font-display font-black flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                            <CalendarIcon className="h-5 w-5" />
                        </div>
                        إضافة موعد جديد
                    </DrawerTitle>
                    <DrawerDescription className="text-sm text-muted-foreground px-1">
                        أضف بيانات المريض وتفاصيل الحجز الجديد بسهولة
                    </DrawerDescription>
                </DrawerHeader>
                <div className="px-1 overflow-y-auto max-h-[80vh]">
                    {AppointmentForm}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
