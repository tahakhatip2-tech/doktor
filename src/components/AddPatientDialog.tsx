
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2, Droplet, AlertTriangle, Stethoscope } from "lucide-react";
import { dataApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AddPatientDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AddPatientDialog({ isOpen, onClose, onSuccess }: AddPatientDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        bloodType: "",
        allergies: "",
        chronicDiseases: "",
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.phone.trim()) {
            toast({
                title: "بيانات ناقصة",
                description: "يرجى تعبئة الاسم ورقم الهاتف على الأقل",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            // Validate phone number format
            let formattedPhone = formData.phone.replace(/\D/g, ''); // Remove non-digits

            // Basic Jordanian phone validation
            if (formattedPhone.startsWith('07')) {
                formattedPhone = '962' + formattedPhone.substring(1);
            } else if (formattedPhone.startsWith('7')) {
                formattedPhone = '962' + formattedPhone;
            }

            await dataApi.post('/contacts', {
                name: formData.name,
                phone: formattedPhone,
                blood_type: formData.bloodType || null,
                allergies: formData.allergies || null,
                chronic_diseases: formData.chronicDiseases || null,
                is_manual: true
            });

            toast({
                title: "تمت الإضافة بنجاح",
                description: "تم إضافة المريض الجديد إلى السجلات",
            });

            setFormData({
                name: "",
                phone: "",
                bloodType: "",
                allergies: "",
                chronicDiseases: "",
            });
            onSuccess?.();
            onClose();

        } catch (error: any) {
            console.error('Error adding patient:', error);
            toast({
                title: "خطأ في الإضافة",
                description: error.message || "حدث خطأ أثناء إضافة المريض",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        إضافة مريض جديد
                    </DialogTitle>
                    <DialogDescription>
                        أضف بيانات المريض الأساسية والطبية لإنشاء ملف كامل له.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            البيانات الأساسية
                        </h3>
                        <div className="grid gap-4 w-full">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-right">اسم المريض *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="الاسم الرباعي"
                                    className="text-right"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone" className="text-right">رقم الهاتف *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="079xxxxxxx"
                                    className="text-left"
                                    dir="ltr"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            المعلومات الطبية (اختياري)
                        </h3>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="bloodType" className="text-right flex items-center gap-2">
                                    <Droplet className="h-3.5 w-3.5 text-red-500" />
                                    فصيلة الدم
                                </Label>
                                <Select
                                    value={formData.bloodType}
                                    onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
                                >
                                    <SelectTrigger className="text-right">
                                        <SelectValue placeholder="اختر فصيلة الدم" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bloodTypes.map((type) => (
                                            <SelectItem key={type} value={type} dir="ltr">
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="allergies" className="text-right flex items-center gap-2">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                    الحساسية
                                </Label>
                                <Textarea
                                    id="allergies"
                                    value={formData.allergies}
                                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                    placeholder="مثال: حساسية من البنسلين، حساسية من المكسرات..."
                                    className="text-right min-h-[80px]"
                                    dir="rtl"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="chronicDiseases" className="text-right flex items-center gap-2">
                                    <Stethoscope className="h-3.5 w-3.5 text-blue-500" />
                                    التاريخ المرضي (الأمراض المزمنة)
                                </Label>
                                <Textarea
                                    id="chronicDiseases"
                                    value={formData.chronicDiseases}
                                    onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
                                    placeholder="مثال: ضغط الدم، السكري، أمراض القلب..."
                                    className="text-right min-h-[80px]"
                                    dir="rtl"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            حفظ البيانات
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
