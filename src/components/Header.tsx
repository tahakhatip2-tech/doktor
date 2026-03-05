import { useState, useEffect } from 'react';
import { useClinicContext } from '@/context/ClinicContext';
import { useNavigate } from 'react-router-dom';
import {
    User,
    LogOut,
    Settings,
    Moon,
    Sun,
    ChevronDown,
    Clock,
    Calendar,
    Bell,
    LayoutDashboard,
    MessageCircle,
    Users,
    FileText,
    LineChart,
    CheckCircle2,
    Menu as MenuIcon,
    Sparkles,
    Languages,
    UserPlus,
    CalendarCheck,
    CalendarX,
    AlertCircle,
    Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useSocketNotifications } from '@/hooks/useSocketNotifications';
import { useTheme } from '@/hooks/useTheme';
import { whatsappApi, appointmentsApi, BASE_URL } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface HeaderProps {
    onNavigate?: (path: string) => void;
    onTabChange?: (tab: string) => void;
    activeTab?: string;
    transparent?: boolean;
}

const Header = ({ onNavigate, onTabChange, activeTab, transparent }: HeaderProps) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    // Enable Real-Time Socket Notifications
    useSocketNotifications();

    const { settings } = useClinicContext();
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const loadHeaderData = async () => {
            try {
                const statsData = await appointmentsApi.getStats();
                setStats(statsData);
            } catch (error) {
                console.error('Error fetching header data:', error);
            }
        };
        loadHeaderData();
    }, []);

    const clinicLogo = settings?.clinic_logo
        ? (settings.clinic_logo.startsWith('http') ? settings.clinic_logo : `${BASE_URL}${settings.clinic_logo}`)
        : '/logo.png';

    const clinicName = settings?.clinic_name || "نظام العيادة";
    const clinicDesc = settings?.clinic_description || "إدارة ذظƒظٹة";

    const [navItems] = useState([
        { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
        { id: 'whatsapp-bot', label: 'المحادثات', icon: MessageCircle },
        { id: 'contacts', label: 'المرضى', icon: Users },
        { id: 'appointments', label: 'المواعيد', icon: Calendar },
        { id: 'patient-inquiry', label: 'بوابة المرضى', icon: FileText },
        { id: 'bot-stats', label: 'الإحصائيات', icon: LineChart },
        { id: 'templates', label: 'النماذج', icon: FileText },
    ]);

    return (
        <header className={`sticky top-0 z-50 w-full border-b border-white/5 transition-all duration-300 ${transparent ? 'bg-white/5 backdrop-blur-3xl' : 'bg-background/40 backdrop-blur-[100px]'} shadow-none`}>
            <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 mx-auto max-w-7xl">

                {/* Mobile Layout: Unified Profile & Menu (Right) + Clinic Branding (Left) */}
                <div className="flex lg:hidden items-center justify-between w-full gap-2 min-w-0" dir="rtl">
                    {/* Right Side: Quick Actions & Profile Dropdown Row */}
                    <div className="flex items-center gap-1.5 sm:gap-3">
                        {/* Profile & Menu Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative group outline-none active:scale-95 transition-all duration-300">
                                    <div className="relative">
                                        <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full blur-md opacity-20 group-hover:opacity-40 transition duration-500" />
                                        <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white overflow-hidden shadow-xl border-2 border-white/50 dark:border-blue-900/50">
                                            {user?.avatar ?
                                                <img
                                                    src={user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}${user.avatar}`}
                                                    className="h-full w-full object-cover"
                                                /> :
                                                <User className="h-5 w-5" />
                                            }
                                        </div>
                                        {/* Hamburger/Menu Badge */}
                                        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-white dark:bg-blue-950 rounded-full flex flex-col items-center justify-center gap-0.5 border-2 border-blue-50 dark:border-blue-950 shadow-lg group-hover:scale-110 transition-transform">
                                            <div className="w-2.5 h-[1.5px] bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                            <div className="w-1.5 h-[1.5px] bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                            <div className="w-2.5 h-[1.5px] bg-blue-600 dark:bg-blue-400 rounded-full"></div>

                                            {/* Green Status Dot (Glow) */}
                                            <div className="absolute -top-0.5 -left-0.5 h-2 w-2">
                                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                                <div className="relative h-2 w-2 bg-green-500 rounded-full border border-white dark:border-blue-950"></div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                className="w-[calc(100vw-2rem)] sm:w-80 mt-4 p-2.5 rounded-[2rem] border-blue-200/50 dark:border-blue-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl shadow-[0_20px_60px_rgba(37,99,235,0.2)] animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto scrollbar-hide"
                                sideOffset={8}
                            >
                                {/* Doctor Jo Branding Section */}
                                <div className="flex flex-col items-center p-6 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/20 mb-2 rounded-t-[2rem] border-b border-blue-100/20">
                                    <div className="relative group mb-3">
                                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                        <img
                                            src="/hakeem-logo.png"
                                            alt="Doctor Jo"
                                            className="h-16 w-16 object-contain relative rounded-2xl transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/logo.png';
                                            }}
                                        />
                                    </div>
                                    <h2 className="text-xl font-black tracking-tighter bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 bg-clip-text text-transparent">
                                        DOCTOR JO
                                    </h2>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent opacity-80 mt-1">
                                        Clinic Management System
                                    </p>
                                </div>

                                {/* Counters Section */}
                                <div className="grid grid-cols-3 gap-2 mb-4 px-1">
                                    <div className="bg-blue-600 dark:bg-blue-600 rounded-2xl p-2.5 shadow-lg shadow-blue-600/20 text-center flex flex-col items-center justify-center gap-0.5 transform transition-transform active:scale-95">
                                        <Users className="h-4 w-4 text-white" />
                                        <p className="text-[14px] font-black text-white">{stats?.today_total || 0}</p>
                                        <p className="text-[8px] font-bold text-white/70">مظˆاعظٹد اليوم</p>
                                    </div>
                                    <div className="bg-orange-500 dark:bg-orange-600 rounded-2xl p-2.5 shadow-lg shadow-orange-500/20 text-center flex flex-col items-center justify-center gap-0.5 transform transition-transform active:scale-95">
                                        <Clock className="h-4 w-4 text-white" />
                                        <p className="text-[14px] font-black text-white">{stats?.today_waiting || 0}</p>
                                        <p className="text-[8px] font-bold text-white/70">في الانتظار</p>
                                    </div>
                                    <div className="bg-green-600 dark:bg-green-600 rounded-2xl p-2.5 shadow-lg shadow-green-600/20 text-center flex flex-col items-center justify-center gap-0.5 transform transition-transform active:scale-95">
                                        <CheckCircle2 className="h-4 w-4 text-white" />
                                        <p className="text-[14px] font-black text-white">{stats?.today_completed || 0}</p>
                                        <p className="text-[8px] font-bold text-white/70">تم الظپحص</p>
                                    </div>
                                </div>

                                {/* Navigation Items */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {navItems.map((item) => (
                                        <DropdownMenuItem
                                            key={item.id}
                                            onSelect={() => onTabChange && onTabChange(item.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer group/item text-center gap-1.5",
                                                activeTab === item.id
                                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                                                    : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 text-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-800/30 font-black"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            <span className="text-[10px]">{item.label}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </div>

                                <DropdownMenuSeparator className="bg-blue-100/50 dark:bg-blue-900/50 my-2" />

                                {/* Management Quick Actions */}
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    <DropdownMenuItem
                                        onSelect={() => onNavigate ? onNavigate('/profile') : navigate('/profile')}
                                        className="flex flex-col items-center justify-center p-2 rounded-2xl border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-100 hover:bg-blue-100"
                                    >
                                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <span className="text-[8px] font-black">حسابظٹ</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => onNavigate ? onNavigate('/admin') : navigate('/admin')}
                                        className="flex flex-col items-center justify-center p-2 rounded-2xl border border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10 text-orange-900 dark:text-orange-100 hover:bg-orange-100"
                                    >
                                        <LayoutDashboard className="h-5 w-5 text-orange-500" />
                                        <span className="text-[8px] font-black">الأدمن</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => onTabChange && onTabChange('clinic-settings')}
                                        className="flex flex-col items-center justify-center p-2 rounded-2xl border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-100 hover:bg-blue-100"
                                    >
                                        <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <span className="text-[8px] font-black">الإعدادات</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => signOut()}
                                        className="flex flex-col items-center justify-center p-2 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 text-red-900 dark:text-red-100 hover:bg-red-100"
                                    >
                                        <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        <span className="text-[8px] font-black">خرظˆج</span>
                                    </DropdownMenuItem>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-10 gap-3 rounded-2xl text-blue-600/60 font-black text-[11px] hover:bg-blue-50/50"
                                    onClick={toggleTheme}
                                >
                                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                    </div>
                                    {theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                                </Button>

                                {/* Signature */}
                                <div className="mt-4 pt-4 border-t border-blue-100/30 dark:border-blue-900/30 text-center">
                                    <p className="text-[8px] font-bold text-blue-600/30 dark:text-blue-400/20 uppercase tracking-[0.3em]">
                                        Powered by Al-Khatib
                                    </p>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile Notification Bell */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 rounded-full bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 shadow-sm active:scale-90 relative"
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-blue-950 shadow-md animate-bounce">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 mt-2 p-0 rounded-xl border-border bg-card/95 backdrop-blur-3xl shadow-xl" sideOffset={8}>
                                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                                    <h4 className="font-bold text-sm text-foreground">الإشعارات</h4>
                                    {unreadCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            className="h-6 text-[10px] text-primary hover:bg-primary/10"
                                            onClick={() => markAllAsRead.mutate()}
                                        >
                                            تحديد الكل كمقروء
                                        </Button>
                                    )}
                                </div>
                                <ScrollArea className="h-[300px]">
                                    {notifications?.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                                            <p className="text-xs">لا توجد إشعاراطھ جديدة</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col p-1">
                                            {notifications?.slice(0, 10).map((notification) => {
                                                let Icon = Bell;
                                                let colorClass = 'bg-gray-500/10 text-gray-500 border-gray-500/20';

                                                if (notification.type === 'NEW_PATIENT') {
                                                    Icon = UserPlus;
                                                    colorClass = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
                                                } else if (notification.type === 'NEW_APPOINTMENT') {
                                                    Icon = CalendarCheck;
                                                    colorClass = 'bg-blue-500/10 text-blue-600 border-blue-500/20';
                                                } else if (notification.type === 'APPOINTMENT_CANCELLED') {
                                                    Icon = CalendarX;
                                                    colorClass = 'bg-red-500/10 text-red-600 border-red-500/20';
                                                } else if (notification.type === 'APPOINTMENT_COMPLETED') {
                                                    Icon = CheckCircle2;
                                                    colorClass = 'bg-purple-500/10 text-purple-600 border-purple-500/20';
                                                } else if (notification.message?.includes('BOT') || notification.title?.includes('BOT')) {
                                                    Icon = Bot;
                                                    colorClass = 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
                                                }

                                                return (
                                                    <DropdownMenuItem
                                                        key={notification.id}
                                                        className={cn(
                                                            "flex flex-col items-start gap-1 p-3 cursor-pointer rounded-xl mb-1 transition-all duration-200 border-b border-border/40 last:border-0",
                                                            !notification.is_read ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-muted/50"
                                                        )}
                                                        onSelect={() => {
                                                            if (!notification.is_read) markAsRead.mutate(notification.id);

                                                            // Navigate based on type
                                                            if (notification.type === 'NEW_PATIENT' || notification.contactId) {
                                                                if (onTabChange) onTabChange('contacts');
                                                                navigate('/');
                                                            } else if (
                                                                notification.type === 'NEW_APPOINTMENT' ||
                                                                notification.type === 'APPOINTMENT_CANCELLED' ||
                                                                notification.type === 'APPOINTMENT_COMPLETED' ||
                                                                notification.appointmentId
                                                            ) {
                                                                if (onTabChange) onTabChange('appointments');
                                                                navigate('/');
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-start w-full gap-3">
                                                            {/* Icon Box */}
                                                            <div className={cn("h-9 w-9 rounded-full flex items-center justify-center border shadow-sm shrink-0 mt-0.5", colorClass)}>
                                                                <Icon className="h-4 w-4" />
                                                            </div>

                                                            <div className="flex-1 space-y-1 overflow-hidden">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className={cn(
                                                                        "text-sm leading-none truncate",
                                                                        !notification.is_read ? "font-black text-foreground" : "font-semibold text-muted-foreground"
                                                                    )}>
                                                                        {notification.title}
                                                                    </p>
                                                                    {!notification.is_read && (
                                                                        <span className="h-2 w-2 rounded-full bg-blue-600 ring-2 ring-blue-600/20 animate-pulse" />
                                                                    )}
                                                                </div>

                                                                <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
                                                                    {notification.message}
                                                                </p>

                                                                <p className="text-[9px] text-muted-foreground/40 font-medium flex items-center gap-1 pt-1">
                                                                    <Clock className="h-2.5 w-2.5" />
                                                                    {(() => {
                                                                        try {
                                                                            const date = new Date(notification.created_at);
                                                                            return isNaN(date.getTime())
                                                                                ? 'الآن'
                                                                                : formatDistanceToNow(date, { addSuffix: true, locale: ar });
                                                                        } catch (e) {
                                                                            return 'الآن';
                                                                        }
                                                                    })()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </DropdownMenuItem>
                                                );
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Static Language Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 rounded-full bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 shadow-sm active:scale-90"
                        >
                            <Languages className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Left Side: Doctor Jo Branding (Mobile) */}
                    <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                        <div className="flex flex-col items-end leading-none min-w-0">
                            <h1 className="text-xs font-black tracking-tight bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 bg-clip-text text-transparent truncate w-full text-right">
                                DOCTOR JO
                            </h1>
                            <p className="text-[7px] font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent truncate w-full text-right">Clinic Management System</p>
                        </div>
                        <div className="h-9 w-9 relative flex-shrink-0">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur opacity-30"></div>
                            <img
                                src="/hakeem-logo.png"
                                alt="Doctor Jo Logo"
                                className="relative h-full w-full object-contain rounded-xl"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = './logo.png';
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop Layout: Original Structure */}
                <div className="hidden lg:flex items-center justify-between w-full">
                    {/* 1. Actions & Unified Profile (Right side in RTL) */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Desktop Profile Pill - Now at the far right edge */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 pr-1.5 pl-4 py-1.5 rounded-full hover:bg-muted/30 transition-all duration-300 group outline-none border border-transparent hover:border-border/50 active:scale-95">
                                    <div className="relative">
                                        <div className="relative h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden ring-1 ring-border/50 group-hover:ring-primary/50 transition-all">
                                            {user?.avatar ?
                                                <img
                                                    src={user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}${user.avatar}`}
                                                    className="h-full w-full object-cover"
                                                /> :
                                                <User className="h-5 w-5" />
                                            }
                                        </div>
                                        {/* Facebook-style Hamburger Badge */}
                                        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-background rounded-full border border-border shadow-sm flex flex-col items-center justify-center gap-[1.5px] group-hover:scale-110 transition-transform">
                                            <div className="w-2 h-[1px] bg-muted-foreground group-hover:bg-primary transition-colors"></div>
                                            <div className="w-1.5 h-[1px] bg-muted-foreground group-hover:bg-primary transition-colors"></div>
                                            <div className="w-2 h-[1px] bg-muted-foreground group-hover:bg-primary transition-colors"></div>

                                            {/* Green Status Dot (Glow) */}
                                            <div className="absolute -top-0.5 -left-0.5 h-1.5 w-1.5">
                                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                                <div className="relative h-1.5 w-1.5 bg-green-500 rounded-full border border-white dark:border-background"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start mr-1 text-right">
                                        <span className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-bold uppercase tracking-tighter mb-0.5">
                                            مرحباً بك
                                        </span>
                                        <span className="text-[13px] font-black text-blue-900 dark:text-blue-100 leading-tight">
                                            {user?.name ? (user.name.includes('د.') || user.name.startsWith('د ') ? user.name : `د. ${user.name}`) : "دكتور"}
                                        </span>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-64 mt-4 p-2 rounded-2xl border border-border bg-card/95 backdrop-blur-3xl shadow-xl animate-in fade-in zoom-in-95"
                                sideOffset={8}
                            >
                                <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl mb-2 flex items-center gap-3 border border-blue-200 dark:border-blue-800">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {user?.name?.[0] || 'D'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-blue-900 dark:text-blue-100">{user?.name || 'Doctor Store'}</p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">{user?.role === 'admin' ? 'مدير النظام' : 'طبيب'}</p>
                                    </div>
                                </div>

                                <DropdownMenuSeparator className="bg-blue-100 dark:bg-blue-900 my-1" />

                                <DropdownMenuItem
                                    onSelect={() => onNavigate ? onNavigate('/profile') : navigate('/profile')}
                                    className="rounded-xl focus:bg-blue-50 dark:focus:bg-blue-950/20 focus:text-blue-700 dark:focus:text-blue-300 cursor-pointer gap-3 py-2.5 text-sm font-bold group"
                                >
                                    <div className="p-1.5 rounded-lg bg-background border border-blue-200 dark:border-blue-800 group-hover:border-blue-400 dark:group-hover:border-blue-600 transition-colors">
                                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    حسابظٹ
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onSelect={() => onTabChange && onTabChange('clinic-settings')}
                                    className="rounded-xl focus:bg-blue-50 dark:focus:bg-blue-950/20 focus:text-blue-700 dark:focus:text-blue-300 cursor-pointer gap-3 py-2.5 text-sm font-bold group"
                                >
                                    <div className="p-1.5 rounded-lg bg-background border border-blue-200 dark:border-blue-800 group-hover:border-blue-400 dark:group-hover:border-blue-600 transition-colors">
                                        <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    إعدادات النظام
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onSelect={() => onTabChange && onTabChange('dashboard')}
                                    className="rounded-xl focus:bg-blue-50 dark:focus:bg-blue-950/20 focus:text-blue-700 dark:focus:text-blue-300 cursor-pointer gap-3 py-2.5 text-sm font-bold group"
                                >
                                    <div className="p-1.5 rounded-lg bg-background border border-blue-200 dark:border-blue-800 group-hover:border-blue-400 dark:group-hover:border-blue-600 transition-colors">
                                        <LayoutDashboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    الواجهات
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="bg-blue-100 dark:bg-blue-900 my-2" />

                                <div className="p-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start gap-2 rounded-xl mb-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-700"
                                        onClick={toggleTheme}
                                    >
                                        {theme === 'dark' ? <Sun className="h-4 w-4 text-blue-600" /> : <Moon className="h-4 w-4 text-blue-600" />}
                                        <span>{theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full justify-start gap-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300"
                                        onClick={() => signOut()}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>تسجيل الخروج</span>
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="h-8 w-[1px] bg-border/50" />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="rounded-full h-10 w-10 hover:bg-muted/30 transition-all active:scale-90 relative group"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5 text-orange-400" /> : <Moon className="h-5 w-5 text-primary" />}
                        </Button>

                        {/* Notification Bell */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full h-10 w-10 hover:bg-muted/30 relative transition-all"
                                >
                                    <Bell className="h-5 w-5 text-primary" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary border-2 border-background"></span>
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl border-border bg-card/95 backdrop-blur-3xl shadow-xl" sideOffset={8}>
                                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                                    <h4 className="font-bold text-sm text-foreground">الإشعارات</h4>
                                    {unreadCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            className="h-6 text-[10px] text-primary hover:bg-primary/10"
                                            onClick={() => markAllAsRead.mutate()}
                                        >
                                            تحديد الكل كمقروء
                                        </Button>
                                    )}
                                </div>
                                <ScrollArea className="h-[300px]">
                                    {notifications?.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                                            <p className="text-xs">لا توجد إشعاراطھ جديدة</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col p-1">
                                            {notifications?.slice(0, 10).map((notification) => {
                                                let Icon = Bell;
                                                let colorClass = 'bg-gray-500/10 text-gray-500 border-gray-500/20';

                                                if (notification.type === 'NEW_PATIENT') {
                                                    Icon = UserPlus;
                                                    colorClass = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
                                                } else if (notification.type === 'NEW_APPOINTMENT') {
                                                    Icon = CalendarCheck;
                                                    colorClass = 'bg-blue-500/10 text-blue-600 border-blue-500/20';
                                                } else if (notification.type === 'APPOINTMENT_CANCELLED') {
                                                    Icon = CalendarX;
                                                    colorClass = 'bg-red-500/10 text-red-600 border-red-500/20';
                                                } else if (notification.type === 'APPOINTMENT_COMPLETED') {
                                                    Icon = CheckCircle2;
                                                    colorClass = 'bg-purple-500/10 text-purple-600 border-purple-500/20';
                                                } else if (notification.message?.includes('BOT') || notification.title?.includes('BOT')) {
                                                    Icon = Bot;
                                                    colorClass = 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
                                                }

                                                return (
                                                    <DropdownMenuItem
                                                        key={notification.id}
                                                        className={cn(
                                                            "flex flex-col items-start gap-1 p-3 cursor-pointer rounded-xl mb-1 transition-all duration-200 border-b border-border/40 last:border-0",
                                                            !notification.is_read ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-muted/50"
                                                        )}
                                                        onSelect={() => {
                                                            if (!notification.is_read) markAsRead.mutate(notification.id);

                                                            // Navigate based on type
                                                            if (notification.type === 'NEW_PATIENT' || notification.contactId) {
                                                                if (onTabChange) onTabChange('contacts');
                                                                navigate('/');
                                                            } else if (
                                                                notification.type === 'NEW_APPOINTMENT' ||
                                                                notification.type === 'APPOINTMENT_CANCELLED' ||
                                                                notification.type === 'APPOINTMENT_COMPLETED' ||
                                                                notification.appointmentId
                                                            ) {
                                                                if (onTabChange) onTabChange('appointments');
                                                                navigate('/');
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-start w-full gap-3">
                                                            {/* Icon Box */}
                                                            <div className={cn("h-9 w-9 rounded-full flex items-center justify-center border shadow-sm shrink-0 mt-0.5", colorClass)}>
                                                                <Icon className="h-4 w-4" />
                                                            </div>

                                                            <div className="flex-1 space-y-1 overflow-hidden">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className={cn(
                                                                        "text-sm leading-none truncate",
                                                                        !notification.is_read ? "font-black text-foreground" : "font-semibold text-muted-foreground"
                                                                    )}>
                                                                        {notification.title}
                                                                    </p>
                                                                    {!notification.is_read && (
                                                                        <span className="h-2 w-2 rounded-full bg-blue-600 ring-2 ring-blue-600/20 animate-pulse" />
                                                                    )}
                                                                </div>

                                                                <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
                                                                    {notification.message}
                                                                </p>

                                                                <p className="text-[9px] text-muted-foreground/40 font-medium flex items-center gap-1 pt-1">
                                                                    <Clock className="h-2.5 w-2.5" />
                                                                    {(() => {
                                                                        try {
                                                                            const date = new Date(notification.created_at);
                                                                            return isNaN(date.getTime())
                                                                                ? 'الآن'
                                                                                : formatDistanceToNow(date, { addSuffix: true, locale: ar });
                                                                        } catch (e) {
                                                                            return 'الآن';
                                                                        }
                                                                    })()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </DropdownMenuItem>
                                                );
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* 2. Professional Real-time Dynamic Clock Removed */}

                    {/* 3. Branding (Left side in RTL) */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end leading-none">
                            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                {clinicName}
                            </h1>
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{clinicDesc}</p>
                        </div>
                        <div className="h-10 w-10 relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full blur opacity-20"></div>
                            <img
                                src={clinicLogo}
                                alt="Logo"
                                className="relative h-full w-full object-contain drop-shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </div >
        </header >
    );
};

export default Header;
