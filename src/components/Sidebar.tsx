import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Settings,
    LogOut,
    MessageCircle,
    Shield,
    Users,
    FileText,
    Calendar,
    LineChart,
    Sparkles,
    Facebook,
    Instagram,
    Linkedin,
    Twitter,
    MessagesSquare,
    Tag,
    Wallet,
    Stethoscope,
    Package,
    Pill,
    HeartPulse,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { whatsappApi, BASE_URL, apiFetch } from "@/lib/api";
import { useActiveDoctor } from "@/context/ActiveDoctorContext";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    clinicCategory?: string;
}

const Sidebar = ({ activeTab, setActiveTab, clinicCategory }: SidebarProps) => {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const isPharmacy = user?.role === 'PHARMACY';

    // جلب عدد الرسائل غير المقروءة
    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const count = await apiFetch('/internal-chat/unread-count');
                setUnreadCount(count || 0);
            } catch { /* ignore */ }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    // إعادة جلب الرسائل غير المقروءة عند الانتقال بعيداً عن الدردشة
    useEffect(() => {
        if (activeTab !== 'internal-chat') return;
        setUnreadCount(0); // إعادة الضبط عند فتح الدردشة
    }, [activeTab]);

    const handleSignOut = async () => {
        await signOut();
        navigate("/auth");
    };

    const { activeDoctor, openLoginModal, logout } = useActiveDoctor();

    const allNavItems = [
        { id: 'dashboard', label: 'الرئيسية', icon: isPharmacy ? Pill : LayoutDashboard },
        { id: 'whatsapp-bot', label: 'محادثات واتساب', icon: MessageCircle },
        { id: 'internal-chat', label: 'الرسائل', icon: MessagesSquare },
        { id: 'contacts', label: 'المرضى', icon: Users },
        { id: 'appointments', label: 'المواعيد', icon: Calendar },
        ...(isPharmacy ? [{ id: 'inventory', label: 'إدارة المنتجات', icon: Package }] : []),
        { id: 'finance', label: 'المحاسبة', icon: Wallet },
        { id: 'offers', label: 'آخر الأخبار', icon: Tag },
        { id: 'bot-stats', label: 'الإحصائيات', icon: LineChart },
        { id: 'templates', label: 'النماذج', icon: FileText },
    ];

    if (clinicCategory === 'beauty_center') {
        allNavItems.splice(1, 0, { id: 'beauty-services', label: 'إدارة الخدمات', icon: Sparkles });
    } else if (clinicCategory === 'home_care') {
        allNavItems.splice(1, 0, { id: 'homecare-services', label: 'خدمات الرعاية', icon: HeartPulse });
    }

    const mainNavItems = allNavItems.filter(item => {
        if (!activeDoctor && user?.role !== 'PHARMACY') return true;
        
        if (user?.role === 'PHARMACY') {
            return ['dashboard', 'inventory', 'finance', 'internal-chat', 'offers'].includes(item.id);
        }

        const doctorRole = activeDoctor?.role || 'doctor';
        
        if (doctorRole === 'doctor') {
            return ['contacts', 'appointments', 'internal-chat'].includes(item.id);
        } else if (doctorRole === 'secretary' || doctorRole === 'nurse') {
            return ['appointments', 'internal-chat'].includes(item.id);
        }
        
        return false;
    });

    const handleNavClick = (item: typeof mainNavItems[0]) => {
        setActiveTab(item.id);
    };

    // ── ألوان الثيم ──
    const isBeauty = clinicCategory === 'beauty_center';
    const isHomeCare = clinicCategory === 'home_care';
    
    const activeItemClass = isPharmacy
        ? "bg-white text-emerald-600 shadow-md font-black border-r-4 border-emerald-500 rounded-l-lg rounded-r-none translate-x-1"
        : isBeauty
            ? "bg-white text-fuchsia-600 shadow-md font-black border-r-4 border-fuchsia-500 rounded-l-lg rounded-r-none translate-x-1"
            : isHomeCare
                ? "bg-white text-indigo-600 shadow-md font-black border-r-4 border-indigo-500 rounded-l-lg rounded-r-none translate-x-1"
                : "bg-white text-primary shadow-md font-black border-r-4 border-primary rounded-l-lg rounded-r-none translate-x-1";

    const inactiveItemClass = isPharmacy
        ? "text-emerald-100/80 font-medium hover:text-white hover:bg-emerald-600/30 hover:font-bold hover:translate-x-1"
        : isBeauty
            ? "text-fuchsia-600/70 font-medium hover:text-fuchsia-600 hover:bg-white/50 hover:font-bold hover:translate-x-1"
            : isHomeCare
                ? "text-indigo-600/70 font-medium hover:text-indigo-600 hover:bg-white/50 hover:font-bold hover:translate-x-1"
                : "text-primary/70 font-medium hover:text-primary hover:bg-white/50 hover:font-bold hover:translate-x-1";

    const sidebarBg = isPharmacy
        ? "bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-900"
        : isBeauty
            ? "bg-gradient-to-b from-fuchsia-900 via-purple-900 to-fuchsia-950"
            : isHomeCare
                ? "bg-gradient-to-b from-indigo-900 via-violet-900 to-indigo-950"
                : "bg-white/5 dark:bg-black/10 backdrop-blur-[120px]";

    const headerBorderColor = isPharmacy ? "border-emerald-600/40" : isBeauty ? "border-fuchsia-600/40" : isHomeCare ? "border-indigo-600/40" : "border-white/10";
    const footerBorderColor = isPharmacy ? "border-emerald-600/30 bg-emerald-900/60" : isBeauty ? "border-fuchsia-600/30 bg-fuchsia-950/60" : isHomeCare ? "border-indigo-600/30 bg-indigo-950/60" : "border-white/5 bg-card/10 backdrop-blur-2xl";
    const dividerColor = isPharmacy ? "border-emerald-600/30" : isBeauty ? "border-fuchsia-600/30" : isHomeCare ? "border-indigo-600/30" : "border-white/10";

    return (
        <div className={cn("w-full h-full flex flex-col overflow-hidden border-l", isPharmacy ? "border-emerald-600/30" : isBeauty ? "border-fuchsia-600/30" : isHomeCare ? "border-indigo-600/30" : "border-white/5", sidebarBg)}>
            {/* Header */}
            <div className={cn("p-6 border-b flex-shrink-0", headerBorderColor)}>
                <div className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="relative h-12 w-12 flex-shrink-0">
                        <div className={cn(
                            "absolute -inset-1 rounded-2xl blur opacity-40 animate-pulse",
                            isPharmacy
                                ? "bg-gradient-to-r from-emerald-400 to-green-300"
                                : "bg-gradient-to-r from-blue-600 to-orange-500"
                        )} />
                        <img
                            src="/hakeem-logo.png"
                            alt="Doctor Jo Logo"
                            className="relative h-full w-full rounded-2xl shadow-2xl object-contain transition-all duration-500 hover:scale-110 hover:rotate-3"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = './logo.png';
                            }}
                        />
                    </div>
                    <div className="overflow-hidden">
                        <h1 className={cn(
                            "text-lg font-display font-black leading-tight bg-clip-text text-transparent tracking-tight",
                            isPharmacy
                                ? "bg-gradient-to-r from-emerald-200 via-green-100 to-white"
                                : isBeauty
                                    ? "bg-gradient-to-r from-fuchsia-200 via-pink-100 to-white"
                                    : isHomeCare
                                        ? "bg-gradient-to-r from-indigo-200 via-violet-100 to-white"
                                        : "bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500"
                        )}>
                            DOCTOR JO
                        </h1>
                        <p className={cn(
                            "text-[9px] font-bold uppercase tracking-wider bg-clip-text text-transparent",
                            isPharmacy
                                ? "bg-gradient-to-r from-emerald-300 to-green-100"
                                : isBeauty
                                    ? "bg-gradient-to-r from-fuchsia-300 to-pink-100"
                                    : isHomeCare
                                        ? "bg-gradient-to-r from-indigo-300 to-violet-100"
                                        : "bg-gradient-to-r from-orange-500 to-blue-600"
                        )}>
                            {isPharmacy ? "Pharmacy Management" : isBeauty ? "Beauty Center System" : isHomeCare ? "Home Care Services" : "Clinic Management System"}
                        </p>
                    </div>
                </div>

                {/* Pharmacy Badge */}
                {isPharmacy && (
                    <div className="mt-3 flex items-center gap-2 bg-emerald-600/40 border border-emerald-400/30 rounded-xl px-3 py-2">
                        <Pill className="h-3.5 w-3.5 text-emerald-200" />
                        <span className="text-[10px] font-black text-emerald-100 uppercase tracking-wider">نظام الصيدلية</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-auto" />
                    </div>
                )}
                {/* Beauty Center Badge */}
                {isBeauty && (
                    <div className="mt-3 flex items-center gap-2 bg-fuchsia-600/40 border border-fuchsia-400/30 rounded-xl px-3 py-2">
                        <Sparkles className="h-3.5 w-3.5 text-fuchsia-200" />
                        <span className="text-[10px] font-black text-fuchsia-100 uppercase tracking-wider">مركز التجميل</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse mr-auto" />
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1 px-4 pt-4 pb-4">
                <nav className="space-y-1">
                    {mainNavItems.map((item) => (
                        <Button
                            key={item.id}
                            data-nav-id={item.id}
                            variant={activeTab === item.id ? "secondary" : "ghost"}
                            className={cn(
                                "w-full flex-row-reverse justify-start gap-3 transition-all duration-300 relative overflow-hidden group mb-1",
                                activeTab === item.id ? activeItemClass : inactiveItemClass
                            )}
                            onClick={() => handleNavClick(item)}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-transform duration-300 flex-shrink-0",
                                activeTab === item.id ? "scale-110" : "group-hover:scale-110"
                            )} />
                            <span className="text-sm flex-1 text-right">{item.label}</span>
                            {item.id === 'internal-chat' && unreadCount > 0 && (
                                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-[10px] font-black bg-destructive text-white rounded-full animate-pulse flex-shrink-0">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Button>
                    ))}

                    {user?.role === 'ADMIN' && (
                        <Button
                            variant="ghost"
                            className="w-full flex-row-reverse justify-start gap-3 text-amber-600 hover:text-amber-700 hover:bg-amber-50 mt-4"
                            onClick={() => navigate('/admin')}
                        >
                            <Shield className="h-4 w-4" />
                            لوحة الإدارة
                        </Button>
                    )}

                    <div className={cn("mt-4 pt-4 border-t space-y-1", dividerColor)}>
                        {!activeDoctor && (
                            <>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full flex-row-reverse justify-start gap-3 font-medium hover:translate-x-1 transition-all duration-300",
                                        isPharmacy
                                            ? "text-emerald-100/80 hover:text-white hover:bg-emerald-600/30"
                                            : isBeauty
                                                ? "text-fuchsia-100/80 hover:text-white hover:bg-fuchsia-600/30"
                                                : isHomeCare
                                                    ? "text-indigo-100/80 hover:text-white hover:bg-indigo-600/30"
                                                    : "text-primary/70 hover:text-primary hover:bg-white/50 hover:font-bold"
                                    )}
                                    onClick={() => navigate('/clinic-doctors')}
                                >
                                    <Stethoscope className="h-5 w-5 flex-shrink-0" />
                                    {isPharmacy ? 'إدارة الموظفين' : isBeauty ? 'فريق المركز' : isHomeCare ? 'فريق الرعاية' : 'أطباء العيادة'}
                                </Button>
                                <Button
                                    variant={activeTab === 'clinic-settings' ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full flex-row-reverse justify-start gap-3 transition-all duration-300",
                                        activeTab === 'clinic-settings'
                                            ? activeItemClass
                                            : inactiveItemClass
                                    )}
                                    onClick={() => setActiveTab('clinic-settings')}
                                >
                                    <Settings className="h-5 w-5 flex-shrink-0" />
                                    إعدادات النظام
                                </Button>
                            </>
                        )}
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full flex-row-reverse justify-start gap-3 font-medium hover:translate-x-1 transition-all duration-300",
                                isPharmacy
                                    ? "text-emerald-100/80 hover:text-white hover:bg-emerald-600/30"
                                    : isBeauty
                                        ? "text-fuchsia-100/80 hover:text-white hover:bg-fuchsia-600/30"
                                        : "text-primary/70 hover:text-primary hover:bg-white/50 hover:font-bold"
                            )}
                            onClick={openLoginModal}
                        >
                            <Users className="h-5 w-5 flex-shrink-0" />
                            تبديل المستخدم
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full flex-row-reverse justify-start gap-3 text-red-400 font-medium hover:text-red-300 hover:bg-red-500/20 hover:font-bold hover:translate-x-1 transition-all duration-300"
                            onClick={activeDoctor ? logout : handleSignOut}
                        >
                            <LogOut className="h-5 w-5 flex-shrink-0" />
                            {activeDoctor ? "خروج الطبيب" : "تسجيل الخروج"}
                        </Button>
                    </div>
                </nav>
            </ScrollArea>

            {/* Sidebar Footer */}
            <div className={cn("p-4 border-t", footerBorderColor)}>
                <div className="flex flex-col items-center gap-3">
                    {/* Logo */}
                    <a
                        href="https://alkhatib-marketing.great-site.net/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group cursor-pointer"
                    >
                        <div className={cn(
                            "absolute -inset-1 rounded-full blur opacity-20 animate-pulse group-hover:animate-[pulse_0.5s_ease-in-out_infinite]",
                            isPharmacy
                                ? "bg-gradient-to-r from-emerald-400 to-green-300"
                                : isBeauty
                                    ? "bg-gradient-to-r from-fuchsia-400 to-pink-300"
                                    : "bg-gradient-to-r from-blue-600 to-orange-500"
                        )} />
                        <img
                            src="/hakeem-logo.png"
                            alt="Doctor Jo Logo"
                            className="relative h-10 w-10 rounded-xl shadow-lg object-contain transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                        />
                    </a>

                    {/* Brand Name */}
                    <h2 className={cn(
                        "text-xs font-black tracking-tight bg-clip-text text-transparent text-center leading-tight",
                        isPharmacy
                            ? "bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-300"
                            : isBeauty
                                ? "bg-gradient-to-r from-fuchsia-300 via-pink-200 to-fuchsia-300"
                                : "bg-gradient-to-r from-blue-600 via-orange-500 to-blue-600"
                    )}>
                        AL-KHATIB-MARKETING&SOFTWARE
                    </h2>

                    {/* Tagline */}
                    <div className={cn(
                        "flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider",
                        isPharmacy ? "text-emerald-300/70" : isBeauty ? "text-fuchsia-300/70" : "text-blue-600/70"
                    )}>
                        <Sparkles className={cn("h-2 w-2", isPharmacy ? "text-emerald-400" : isBeauty ? "text-fuchsia-400" : "text-orange-500")} />
                        Premium Digital Solutions
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center justify-center gap-2">
                        {[
                            { icon: Facebook, href: "https://www.facebook.com/alkhatib.marketing/" },
                            { icon: Instagram, href: "https://www.instagram.com/alkhatib.marketing/" },
                            { icon: Twitter, href: "https://twitter.com/alkhatib_mkt" },
                            { icon: Linkedin, href: "https://www.linkedin.com/company/alkhatib-marketing/" }
                        ].map((social, index) => (
                            <a
                                key={index}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "p-1 rounded-full border transition-all duration-300 hover:scale-110 hover:text-white hover:shadow-lg group",
                                    isPharmacy
                                        ? "border-emerald-400/30 text-emerald-300 hover:bg-emerald-500 hover:border-emerald-400"
                                        : isBeauty
                                            ? "border-fuchsia-400/30 text-fuchsia-300 hover:bg-fuchsia-500 hover:border-fuchsia-400"
                                            : "border-blue-600/30 text-blue-600 hover:border-orange-500 hover:bg-gradient-to-r hover:from-blue-600 hover:to-orange-500"
                                )}
                            >
                                <social.icon className="h-3 w-3 transition-transform duration-500 group-hover:rotate-[360deg]" />
                            </a>
                        ))}
                    </div>

                    {/* Version */}
                    <div className={cn("text-[8px] text-center", isPharmacy ? "text-emerald-400/40" : isBeauty ? "text-fuchsia-400/40" : "text-blue-600/40")}>
                        Doctor Jo v1.0
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
