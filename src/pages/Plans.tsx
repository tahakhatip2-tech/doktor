import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Upload, Loader2, Sparkles, Phone, ShieldCheck, FileText } from "lucide-react";
import { toastWithSound } from '@/lib/toast-with-sound';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Plans = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    const plans = [
        {
            id: 'Free Trial',
            name: 'طھجربة مجانظٹة',
            price: 'مجاناً',
            period: 'لمدة أسبظˆع',
            description: 'طھجربة شاملة للنظام',
            features: ['لظˆحة طھحظƒم أساسظٹة', 'عدد محدظˆد من المرضى', 'دعم ظپنظٹ عبر البرظٹد', ' صلاحظٹة لمدة 7 أيام'],
            color: 'from-blue-400 to-blue-600',
            icon: Sparkles,
            isPopular: false
        },
        {
            id: 'Pro',
            name: 'الباقة المطھقدمة (Pro)',
            price: '25 دظٹنار',
            period: 'شهرظٹاً',
            description: 'للعظٹاداطھ المحطھرظپة',
            features: ['مساعد صظˆطھظٹ ذظƒظٹ (AI Voice)', 'ربط ظˆاطھساب مطھقدم', 'عدد غير محدظˆد من المرضى', 'دعم ظپنظٹ أظˆلظˆظٹ'],
            color: 'from-purple-500 to-indigo-600',
            icon: Phone,
            isPopular: true
        },
        {
            id: 'Premium',
            name: 'الباقة الشاملة (Premium)',
            price: '45 دظٹنار',
            period: 'شهرظٹاً',
            description: 'طھحظƒم ظƒامل ظˆأتمطھة',
            features: ['نظام ظˆصظپاطھ طبظٹة PDF', 'جمظٹع ممظٹزاطھ Pro', 'طھقارظٹر ظˆطھحلظٹلاطھ مطھقدمة', 'مدير حساب خاص'],
            color: 'from-orange-400 to-red-500',
            icon: FileText,
            isPopular: false
        }
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReceiptFile(e.target.files[0]);
        }
    };

    const handleSubscribe = async () => {
        if (!selectedPlan) return;

        setIsLoading(true);
        try {
            // Simulate API call for now, replace with actual endpoint
            const formData = new FormData();
            formData.append('planId', selectedPlan);
            if (receiptFile) {
                formData.append('receipt', receiptFile);
            }

            // Mock Success logic
            await new Promise(resolve => setTimeout(resolve, 2000));

            toastWithSound.success("تم اسطھلام طلبك! سظٹتم طھظپعظٹل الباقة خلال دقائق.");
            // navigate('/'); // Uncomment to redirect after success
        } catch (error) {
            toastWithSound.error("حدث خطأ أثناء الاشطھراظƒ. يرجى المحاظˆلة مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4 lg:p-8" dir="rtl">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 resize-bg-animation"
                style={{ backgroundImage: 'url(/auth-bg-pro.png?v=6)' }}
            >
                {/* Overlay Removed */}
            </div>

            <div className="relative z-10 w-full max-w-6xl space-y-8 animate-fade-in-up">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl lg:text-5xl font-black text-white drop-shadow-lg tracking-tight">
                        اختر خطتك المناسبة
                    </h1>
                    <p className="text-blue-100 text-lg lg:text-xl font-medium max-w-2xl mx-auto">
                        ارطھقظگ بعظٹادتك مع حلظˆلنا الذظƒظٹة. اختر الباقة الطھظٹ طھناسب احطھظٹاجاتك ظˆابدأ الطھحظˆل الرقمظٹ اليوم.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={cn(
                                "relative border-0 backdrop-blur-xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden group",
                                selectedPlan === plan.id
                                    ? "bg-white/10 ring-4 ring-orange-500 shadow-2xl scale-105"
                                    : "bg-white/5 hover:bg-white/10"
                            )}
                            onClick={() => setSelectedPlan(plan.id)}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg z-20">
                                    الأظƒثر طلباً
                                </div>
                            )}

                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity", plan.color)}></div>

                            <div className="p-6 lg:p-8 relative z-10 flex flex-col h-full">
                                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-lg", plan.color)}>
                                    <plan.icon className="h-7 w-7 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-3xl font-black text-white">{plan.price}</span>
                                    {plan.price !== 'مجاناً' && <span className="text-sm text-blue-200">/{plan.period}</span>}
                                </div>
                                <p className="text-sm text-blue-100/80 mb-6">{plan.description}</p>

                                <div className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-blue-50">
                                            <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                                <Check className="h-3 w-3 text-green-400" />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    <div className={cn(
                                        "w-full h-12 rounded-xl flex items-center justify-center font-bold transition-all duration-300 border",
                                        selectedPlan === plan.id
                                            ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30"
                                            : "border-white/20 text-white/60 group-hover:border-white/40 group-hover:text-white"
                                    )}>
                                        {selectedPlan === plan.id ? "تم الاخطھظٹار" : "اختر الباقة"}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Payment Section (Shows when Free Trial is NOT selected) */}
                {selectedPlan && selectedPlan !== 'Free Trial' && (
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6 lg:p-8 rounded-3xl animate-fade-in-up">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ShieldCheck className="h-6 w-6 text-green-400" />
                                    الدظپع الآمن عبر المحظپظة
                                </h3>
                                <div className="bg-blue-950/50 p-4 rounded-xl border border-blue-500/30 space-y-2">
                                    <p className="text-blue-200 text-sm">قم بالطھحظˆظٹل إلى محظپظة دظٹنارظƒ:</p>
                                    <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
                                        <span className="text-2xl font-mono font-bold text-white tracking-wider" dir="ltr">+962 7 9585 2716</span>
                                        <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded font-bold">دظٹنارظƒ</span>
                                    </div>
                                    <p className="text-xs text-blue-300/60">* يرجى إرظپاق صظˆرة الظˆصل لتأكيد الطھظپعظٹل</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-white">رظپع صظˆرة الظˆصل</Label>
                                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <div className="flex flex-col items-center gap-2 text-blue-200">
                                        <Upload className="h-8 w-8 text-blue-400" />
                                        {receiptFile ? (
                                            <span className="text-green-400 font-bold">{receiptFile.name}</span>
                                        ) : (
                                            <span>اضط؛ط هنا لرظپع الصظˆرة</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                <div className="text-center pt-8">
                    <Button
                        size="lg"
                        className="h-14 px-12 text-lg rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-xl shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSubscribe}
                        disabled={!selectedPlan || isLoading || (selectedPlan !== 'Free Trial' && !receiptFile)}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                جارظٹ الطھظپعظٹل...
                            </>
                        ) : (
                            "تأكيد الاشطھراظƒ ظˆطھظپعظٹل الحساب"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Plans;
