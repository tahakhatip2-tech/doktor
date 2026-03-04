import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, QrCode, Power, PowerOff, Loader2, Trash2 } from 'lucide-react';
import { toastWithSound } from '@/lib/toast-with-sound';
import { cn } from '@/lib/utils';
import WhatsAppChat from '@/components/WhatsAppChat';
import { whatsappApi } from '@/lib/api';
import HeroSection from '@/components/HeroSection';
import { motion } from "framer-motion";

interface WhatsAppBotProps {
    initialPhone?: string | null;
    initialName?: string | null;
    doctorName?: string;
    onBackCleanup?: () => void;
}

export default function WhatsAppBot({ initialPhone, initialName, doctorName, onBackCleanup }: WhatsAppBotProps) {
    const [status, setStatus] = useState<{ connected: boolean; qrCode: string | null }>({ connected: false, qrCode: null });
    const [loading, setLoading] = useState(false);
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);

    useEffect(() => {
        if (initialPhone) {
            // Normalize the initial phone for matching
            const cleanInitial = initialPhone.replace(/\D/g, '').replace(/^0+/, '');

            // Try to find exact or loose match
            const chat = chats.find(c => {
                if (!c.phone) return false;
                const cleanChatPhone = c.phone.replace(/\D/g, '').replace(/^0+/, '');

                // Critical check: Ensure valid lengths to avoid empty string matching
                if (cleanChatPhone.length < 5 || cleanInitial.length < 5) return false;

                // Check if one ends with the other (most robust for phone numbers with/without country codes)
                return cleanChatPhone.endsWith(cleanInitial) || cleanInitial.endsWith(cleanChatPhone);
            });

            if (chat) {
                // If found existing chat, update name if we have a better one
                if (initialName && chat.name !== initialName) {
                    // Just locally for now
                }
                setSelectedChat(chat);
            } else {
                // If no chat exists, create a temporary one to start conversation
                // Assume it's a new conversation
                // Normalize phone to international format (Jordan preference)
                let normalizedPhone = initialPhone.replace(/\D/g, '');
                if (normalizedPhone.startsWith('0')) normalizedPhone = '962' + normalizedPhone.substring(1);
                if (!normalizedPhone.startsWith('962') && normalizedPhone.length === 9) normalizedPhone = '962' + normalizedPhone;

                const tempChat = {
                    id: Date.now(), // Temporary ID
                    phone: normalizedPhone, // Use normalized phone for sending
                    name: initialName || initialPhone, // Use passed name or phone
                    unread_count: 0,
                    last_message: '',
                    last_message_time: new Date().toISOString(),
                    isTemp: true // Flag to indicate it's not from DB
                };
                setSelectedChat(tempChat);
            }
        }
    }, [initialPhone, chats]);

    useEffect(() => {
        checkStatus();
        loadChats();
        const interval = setInterval(() => {
            checkStatus();
            loadChats();
        }, 5000); // Poll every 5 seconds for status and chats
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const data = await whatsappApi.getStatus();
            // console.log('[WhatsApp] Current Status:', data);
            setStatus(data);
        } catch (error) {
            console.error('Error checking status:', error);
        }
    };

    const loadChats = async () => {
        try {
            const data = await whatsappApi.getChats();
            setChats(data);
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        try {
            await whatsappApi.connect();
            toastWithSound.success('جاري بدء الاتصال... يرجى الانتظار');

            // The polling interval in useEffect will pick up the status change
            // But we keep the local loading state true until we see a change
            let attempts = 0;
            const checkInterval = setInterval(async () => {
                try {
                    const refreshedStatus = await whatsappApi.getStatus();
                    setStatus(refreshedStatus);
                    attempts++;

                    if (refreshedStatus.connected) {
                        clearInterval(checkInterval);
                        setLoading(false);
                        toastWithSound.success('تم الاتصال بنجاح!');
                    } else if (refreshedStatus.qrCode || attempts > 20) {
                        // Stop the local loading spinner once we have a QR or timeout
                        clearInterval(checkInterval);
                        setLoading(false);
                    }
                } catch (err) {
                    console.error('[WhatsApp] Status check failed during connect:', err);
                    attempts++;
                    if (attempts > 20) {
                        clearInterval(checkInterval);
                        setLoading(false);
                        toastWithSound.error('فشل التحقق من حالة الاتصال');
                    }
                }
            }, 2000);
        } catch (error: any) {
            toastWithSound.error(error.message);
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await whatsappApi.disconnect();
            setStatus({ connected: false, qrCode: null });
            setSelectedChat(null);
            toastWithSound.success('تم قطع الاتصال');
        } catch (error: any) {
            toastWithSound.error(error.message);
        }
    };

    const handleDeleteChat = async (e: React.MouseEvent, chatId: number | string) => {
        e.stopPropagation(); // Prevent opening the chat
        if (!confirm('هل أنت متأكد من حذف هذه المحادثة؟')) return;

        try {
            await whatsappApi.deleteChat(chatId);
            setChats(prev => prev.filter(c => c.id !== chatId));
            toastWithSound.success('تم حذف المحادثة بنجاح');
        } catch (error: any) {
            console.error('Failed to delete chat:', error);
            toastWithSound.error('فشل حذف المحادثة');
        }
    };

    if (selectedChat) {
        return (
            <WhatsAppChat
                chat={selectedChat}
                onBack={() => {
                    setSelectedChat(null);
                    if (onBackCleanup) onBackCleanup();
                    loadChats();
                }}
            />
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <HeroSection
                doctorName={doctorName}
                pageTitle="مركز المحادثات المباشرة"
                description="تفعيل النظام والموظف الالي للرد على الرسائل"
                icon={MessageCircle}
                className="mb-8"
            >
                {status.connected ? (
                    <Button
                        onClick={handleDisconnect}
                        className="gap-2 bg-red-500/5 hover:bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-[2px] shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] rounded-none h-10 px-6 font-bold transition-all hover:scale-105 text-xs uppercase tracking-wider relative group overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <PowerOff className="h-3.5 w-3.5" />
                        <span className="relative z-10 w-full text-center">قطع الاتصال</span>
                    </Button>
                ) : (
                    <Button
                        onClick={handleConnect}
                        disabled={loading}
                        className="gap-2 bg-blue-500/5 hover:bg-blue-500/20 text-blue-400 border border-blue-500/50 backdrop-blur-[2px] shadow-[0_0_20px_rgba(37,99,235,0.1)] hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] rounded-none h-10 px-8 font-bold transition-all hover:scale-105 text-xs uppercase tracking-wider group relative overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        {loading ? <Loader2 className="h-4 w-4 animate-spin text-blue-400" /> : <Power className="h-4 w-4 text-blue-400" />}
                        <span className="relative z-10 text-shadow-sm">{loading ? 'جاري الاتصال...' : 'بدء الاتصال بالنظام'}</span>
                    </Button>
                )}
            </HeroSection>

            {/* Connection Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="px-4"
            >
                <Card className="relative overflow-hidden p-4 md:p-6 border-y border-white/10 bg-blue-950/5 backdrop-blur-[80px] rounded-none shadow-2xl group transition-all duration-700 hover:shadow-primary/10">
                    <div className="light-sweep opacity-30" />
                    <div className="absolute inset-0 pointer-events-none border-x border-white/5" />

                    {/* Architectural Accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors duration-700" />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className={cn(
                            "h-12 w-12 rounded-sm flex items-center justify-center shadow-xl transition-all duration-500 ring-1 ring-white/10 group-hover:scale-110",
                            status.connected
                                ? "bg-primary/10 text-primary shadow-primary/20"
                                : "bg-muted/5 text-muted-foreground shadow-muted/5"
                        )}>
                            <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tight">حالة الاتصال بالنظام</h3>
                                {status.connected &&
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                                }
                            </div>
                            <p className={cn(
                                "text-[10px] font-bold uppercase tracking-widest pl-2 border-l-2",
                                status.connected ? "text-primary border-primary" : "text-muted-foreground border-muted-foreground/30"
                            )}>
                                {status.connected ? 'النظام متصل ويعمل بنجاح' : 'بانتظار مسح كود الاتصال'}
                            </p>
                        </div>
                    </div>

                    {!status.connected && (
                        <div className="mt-8 p-8 bg-black/5 dark:bg-white/5 rounded-none border border-dashed border-primary/20 text-center min-h-[350px] flex flex-col justify-center items-center relative z-10 transition-all group-hover:border-primary/40">
                            {status.qrCode ? (
                                <div className="animate-in fade-in zoom-in duration-500">
                                    <div className="h-12 w-12 rounded-none bg-primary text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 rotate-3">
                                        <QrCode className="h-6 w-6" />
                                    </div>
                                    <h4 className="text-lg font-black text-foreground mb-2">امسح الكود عبر واتساب</h4>
                                    <p className="text-xs font-bold text-muted-foreground mb-6 max-w-sm mx-auto uppercase tracking-wide">
                                        الإعدادات ← الأجهزة المرتبطة ← ربط جهاز جديد
                                    </p>
                                    <div className="bg-white p-4 rounded-lg inline-block shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-40 -z-10" />
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(status.qrCode)}`}
                                            alt="QR Code"
                                            className="w-48 h-48 mix-blend-multiply"
                                        />
                                    </div>
                                </div>
                            ) : loading ? (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-20 animate-pulse" />
                                        <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary relative z-10" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-foreground">جاري إنتاج كود الاتصال...</p>
                                        <p className="text-sm font-bold text-primary/60 mt-2 uppercase tracking-widest">يرجى الانتظار</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="h-20 w-20 rounded-none border-2 border-dashed border-primary/30 flex items-center justify-center mx-auto bg-primary/5">
                                        <QrCode className="h-10 w-10 text-primary" />
                                    </div>
                                    <p className="text-sm font-black text-foreground/50 uppercase tracking-widest">اضغط على زر البدء بالأعلى لبدء جلسة جديدة</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bottom Power Line */}
                    <div className="absolute bottom-0 left-0 w-full flex opacity-40 group-hover:opacity-100 transition-opacity duration-1000">
                        <div className="h-[3px] w-1/3 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]" />
                        <div className="h-[3px] flex-1 bg-white/5" />
                    </div>
                </Card>
            </motion.div>

            {/* Professional Divider */}
            <div className="w-full flex items-center justify-center gap-4 my-2 opacity-80">
                <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
            </div>

            {/* Chats List */}
            {status.connected && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 px-4"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
                            <MessageCircle className="h-5 w-5" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">المحادثات النشطة <span className="text-primary opacity-60 text-lg align-top">({chats.length})</span></h3>
                    </div>

                    {chats.length === 0 ? (
                        <Card className="p-16 text-center border-y border-white/5 bg-blue-950/5 backdrop-blur-[80px] rounded-none shadow-2xl">
                            <MessageCircle className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
                            <h4 className="text-lg font-black text-foreground">لا توجد محادثات نشطة</h4>
                            <p className="text-sm text-muted-foreground mt-2 font-bold uppercase tracking-wide">ابدأ بإرسال رسالة من هاتفك لتظهر هنا</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {chats.map((chat) => (
                                <motion.div
                                    key={chat.id}
                                    whileHover={{ y: -5 }}
                                    onClick={() => setSelectedChat(chat)}
                                >
                                    <Card
                                        className="p-4 border-y border-white/10 bg-blue-950/5 backdrop-blur-[80px] rounded-none shadow-xl hover:shadow-primary/10 transition-all cursor-pointer group relative overflow-hidden h-full"
                                    >
                                        <div className="absolute top-0 right-0 w-1 h-full bg-primary/0 group-hover:bg-primary/100 transition-all duration-300" />
                                        <div className="light-sweep opacity-0 group-hover:opacity-20" />

                                        {/* Delete Button */}
                                        <div
                                            onClick={(e) => handleDeleteChat(e, chat.id)}
                                            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 cursor-pointer p-1.5 hover:bg-destructive/10 rounded-sm text-muted-foreground hover:text-destructive"
                                            title="حذف المحادثة"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-sm bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                <div className="relative">
                                                    <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
                                                    {chat.unread_count > 0 && (
                                                        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-destructive rounded-full border border-background" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-black text-foreground truncate text-lg group-hover:text-primary transition-colors leading-tight mb-1">{chat.name || chat.phone}</h4>
                                                    {chat.unread_count > 0 && (
                                                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                                                            {chat.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate opacity-70 group-hover:opacity-100 transition-opacity">{chat.last_message || 'لا توجد رسائل'}</p>
                                                <p className="text-[10px] text-muted-foreground/40 mt-2 font-mono uppercase tracking-wider">
                                                    {new Date(chat.last_message_time).toLocaleString('ar-JO')}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
