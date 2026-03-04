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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { whatsappApi, BASE_URL, apiFetch } from "@/lib/api";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

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

    const mainNavItems = [
        { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
        { id: 'whatsapp-bot', label: 'محادثات واتساب', icon: MessageCircle },
        { id: 'internal-chat', label: 'رسائل المرضى', icon: MessagesSquare },
        { id: 'contacts', label: 'المرضى', icon: Users },
        { id: 'appointments', label: 'المواعيد', icon: Calendar },
        { id: 'bot-stats', label: 'الإحصائيات', icon: LineChart },
        { id: 'templates', label: 'النماذج', icon: FileText },
    ];

    const handleNavClick = (item: typeof mainNavItems[0]) => {
        setActiveTab(item.id);
    };

    return (
        <div className="w-full h-full bg-white/5 dark:bg-black/10 backdrop-blur-[120px] border-l border-white/5 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                    {/* 3D Professional Logo */}
                    <div className="relative h-12 w-12 flex-shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur opacity-30 animate-pulse"></div>
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
                        <h1 className="text-lg font-display font-black leading-tight bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 bg-clip-text text-transparent tracking-tight">
                            DOCTOR JO
                        </h1>
                        <p className="text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                            Clinic Management System
                        </p>
                    </div>
                </div>
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
                                activeTab === item.id
                                    ? "bg-white text-primary shadow-md font-black border-r-4 border-primary rounded-l-lg rounded-r-none translate-x-1"
                                    : "text-primary/70 font-medium hover:text-primary hover:bg-white/50 hover:font-bold hover:translate-x-1"
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

                    {user?.role === 'admin' && (
                        <Button
                            variant="ghost"
                            className="w-full flex-row-reverse justify-start gap-3 text-amber-600 hover:text-amber-700 hover:bg-amber-50 mt-4"
                            onClick={() => navigate('/admin')}
                        >
                            <Shield className="h-4 w-4" />
                            لوحة الإدارة
                        </Button>
                    )}
                </nav>
            </ScrollArea>

            {/* Sidebar Footer - Brand & Socials */}
            <div className="p-4 border-t border-white/5 bg-card/10 backdrop-blur-2xl">
                <div className="flex flex-col items-center gap-3">
                    {/* Logo */}
                    <a
                        href="https://alkhatib-marketing.great-site.net/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group cursor-pointer"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full blur opacity-20 animate-pulse group-hover:animate-[pulse_0.5s_ease-in-out_infinite]"></div>
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
                    <h2 className="text-xs font-black tracking-tight bg-gradient-to-r from-blue-600 via-orange-500 to-blue-600 bg-clip-text text-transparent text-center leading-tight">
                        AL-KHATIB-MARKETING&SOFTWARE
                    </h2>

                    {/* Tagline */}
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600/70 uppercase tracking-wider">
                        <Sparkles className="h-2 w-2 text-orange-500" />
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
                                className="p-1 rounded-full border border-blue-600/30 text-blue-600 transition-all duration-300 hover:scale-110 hover:border-orange-500 hover:bg-gradient-to-r hover:from-blue-600 hover:to-orange-500 hover:text-white hover:shadow-lg group"
                            >
                                <social.icon className="h-3 w-3 transition-transform duration-500 group-hover:rotate-[360deg]" />
                            </a>
                        ))}
                    </div>


                    {/* Version */}
                    <div className="text-[8px] text-blue-600/40 text-center">
                        Doctor Jo v1.0
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
