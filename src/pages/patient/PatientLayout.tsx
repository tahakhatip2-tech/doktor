import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientSocketNotifications } from '@/hooks/usePatientSocketNotifications';
import { usePatientUnreadMessages } from '@/hooks/useUnreadMessages';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Home,
    Calendar,
    Building2,
    FileText,
    Bell,
    User,
    LogOut,
    MessageCircle,
    Languages,
    Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import Footer from '@/components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PatientLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { patient, signOut, loading, token } = usePatientAuth(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { unreadCount: msgCount, setUnreadCount: setMsgCount, lastConversationId, refetch: refetchMsgs } = usePatientUnreadMessages();

    // Real-time notifications + رسائل الدردشة للمريض عبر Socket.io
    usePatientSocketNotifications(
        () => { fetchUnreadCount(); },
        useCallback(() => {
            setMsgCount(prev => prev + 1);
        }, [setMsgCount])
    );

    useEffect(() => {
        if (token) {
            fetchUnreadCount();
        }
    }, [token]);

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(`${API_URL}/patient/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const navItems = [
        { path: '/patient/appointments', label: 'مواعيدي', icon: Calendar },
        { path: '/patient/clinics', label: 'العيادات', icon: Building2 },
        { path: '/patient/dashboard', label: 'الرئيسية', icon: Home }, // المركزية
        { path: '/patient/offers', label: 'العروض', icon: Tag },
        { path: '/patient/medical-records', label: 'السجلات', icon: FileText },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!patient) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-white/70 backdrop-blur-3xl shadow-sm transition-all duration-300">
                <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 mx-auto max-w-7xl">
                    
                    {/* 📱 Mobile Layout (lg:hidden) */}
                    <div className="flex lg:hidden items-center justify-between w-full gap-2 min-w-0" dir="rtl">
                        {/* Right Side: Quick Actions & Profile Dropdown Row */}
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            {/* Profile & Menu Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="relative group outline-none active:scale-95 transition-all duration-300">
                                        <div className="relative">
                                            <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full blur-md opacity-20 group-hover:opacity-40 transition duration-500" />
                                            <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white overflow-hidden shadow-xl border-2 border-white/50">
                                                <span className="font-bold text-lg">{patient?.fullName?.charAt(0) || 'م'}</span>
                                            </div>
                                            {/* Hamburger/Menu Badge */}
                                            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-white rounded-full flex flex-col items-center justify-center gap-0.5 border-2 border-blue-50 shadow-lg group-hover:scale-110 transition-transform">
                                                <div className="w-2.5 h-[1.5px] bg-blue-600 rounded-full"></div>
                                                <div className="w-1.5 h-[1.5px] bg-blue-600 rounded-full"></div>
                                                <div className="w-2.5 h-[1.5px] bg-blue-600 rounded-full"></div>

                                                {/* Green Status Dot (Glow) */}
                                                <div className="absolute -top-0.5 -left-0.5 h-2 w-2">
                                                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                                    <div className="relative h-2 w-2 bg-green-500 rounded-full border border-white"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="end"
                                    className="w-[calc(100vw-2rem)] sm:w-80 mt-4 p-2.5 rounded-[2rem] border-blue-200/50 bg-white/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(37,99,235,0.2)] animate-in fade-in zoom-in-95"
                                    sideOffset={8}
                                >
                                    {/* Patient Branding Section */}
                                    <div className="flex flex-col items-center p-6 bg-gradient-to-b from-blue-50/50 to-transparent mb-2 rounded-t-[2rem] border-b border-blue-100/20">
                                        <div className="relative group mb-3">
                                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                            <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                                                {patient?.fullName?.charAt(0) || 'م'}
                                            </div>
                                        </div>
                                        <h2 className="text-xl font-black tracking-tighter text-blue-900">
                                            {patient?.fullName}
                                        </h2>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent opacity-80 mt-1" dir="ltr">
                                            {patient?.phone}
                                        </p>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="grid grid-cols-2 gap-2 mb-2 p-1">
                                        <DropdownMenuItem
                                            onClick={() => navigate('/patient/profile')}
                                            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-blue-100 bg-blue-50/50 text-blue-900 hover:bg-blue-100 cursor-pointer"
                                        >
                                            <User className="h-5 w-5 text-blue-600 mb-1" />
                                            <span className="text-[10px] font-black">حسابي</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={signOut}
                                            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-red-100 bg-red-50/50 text-red-900 hover:bg-red-100 cursor-pointer"
                                        >
                                            <LogOut className="h-5 w-5 text-red-600 mb-1" />
                                            <span className="text-[10px] font-black">تسجيل الخروج</span>
                                        </DropdownMenuItem>
                                    </div>
                                    
                                    {/* Signature */}
                                    <div className="mt-2 pt-3 border-t border-blue-100/30 text-center">
                                        <p className="text-[8px] font-bold text-blue-600/30 uppercase tracking-[0.3em]">
                                            Powered by Al-Khatib
                                        </p>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Notification Bell */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/patient/notifications')}
                                className="h-11 w-11 rounded-full bg-blue-50/80 border border-blue-200/50 text-blue-600 shadow-sm active:scale-90 relative"
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>

                            {/* Mobile Messages Button with Badge */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/patient/messages')}
                                className="h-11 w-11 rounded-full bg-blue-50/80 border border-blue-200/50 text-blue-600 shadow-sm active:scale-90 relative"
                            >
                                <MessageCircle className="h-5 w-5" />
                                {msgCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                                        {msgCount > 9 ? '9+' : msgCount}
                                    </span>
                                )}
                            </Button>
                        </div>

                        {/* Left Side: Doctor Jo Branding (Mobile) */}
                        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                            <div className="flex flex-col items-end leading-none min-w-0">
                                <h1 className="text-xs font-black tracking-tight bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 bg-clip-text text-transparent truncate w-full text-right">
                                    DOCTOR JO
                                </h1>
                                <p className="text-[7px] font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent truncate w-full text-right">Patient Portal</p>
                            </div>
                            <div className="h-9 w-9 relative flex-shrink-0">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur opacity-30"></div>
                                <img
                                    src="/hakeem-logo.png"
                                    alt="Doctor Jo Logo"
                                    className="relative h-full w-full object-contain rounded-xl"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/logo.png';
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 💻 Desktop Layout (hidden lg:flex) */}
                    <div className="hidden lg:flex items-center justify-between w-full">
                        {/* Desktop Left: Branding */}
                        <Link to="/patient/dashboard" className="flex items-center gap-2 outline-none group">
                            <div className="relative flex-shrink-0">
                                <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 to-orange-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition duration-500" />
                                <div className="relative h-11 w-11 rounded-full p-0.5 border-2 border-white bg-white shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
                                    <img
                                        src="/hakeem-logo.png"
                                        alt="Doctor Jo"
                                        className="h-full w-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/logo.png';
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col items-start leading-none mr-1.5" dir="ltr">
                                <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-blue-700 via-blue-800 to-orange-600 bg-clip-text text-transparent">
                                    DOCTOR JO
                                </h1>
                                <p className="text-[7px] font-bold uppercase tracking-wider text-blue-900/60 text-left">Clinic Management System</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="flex items-center gap-1 bg-muted/30 p-1 rounded-2xl border border-border/50">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link key={item.path} to={item.path}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                'relative rounded-xl h-9 px-4 font-bold text-xs transition-all duration-300',
                                                isActive
                                                    ? 'bg-white text-blue-700 shadow-sm border border-border/50'
                                                    : 'text-muted-foreground hover:text-blue-600'
                                            )}
                                        >
                                            <Icon className={cn("h-4 w-4 ml-2", isActive ? "text-orange-500" : "text-muted-foreground")} />
                                            {item.label}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Desktop Right: Actions */}
                        <div className="flex items-center gap-2" dir="rtl">
                            {/* Desktop: Messages Button with Badge */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/patient/messages')}
                                className="h-10 w-10 rounded-full bg-blue-50 text-blue-700 relative active:scale-95"
                            >
                                <MessageCircle className="h-5 w-5" />
                                {msgCount > 0 && (
                                    <span className="absolute top-0 right-0 h-5 w-5 bg-orange-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                        {msgCount > 9 ? '9+' : msgCount}
                                    </span>
                                )}
                            </Button>

                            {/* Notifications */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/patient/notifications')}
                                className="h-10 w-10 rounded-full bg-blue-50 text-blue-700 relative active:scale-95"
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-orange-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>

                            {/* Profile Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="relative h-10 w-10 rounded-full border-2 border-blue-100 p-0.5 active:scale-95 transition-transform overflow-hidden">
                                        <Avatar className="h-full w-full">
                                            <AvatarFallback className="bg-blue-700 text-white font-bold text-xs">
                                                {patient.fullName?.charAt(0) || 'م'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-2xl shadow-2xl border-blue-50 pb-2">
                                    <DropdownMenuLabel className="px-3 py-2">
                                        <p className="text-sm font-black text-blue-900">{patient.fullName}</p>
                                        <p className="text-[10px] text-blue-600 font-bold" dir="ltr">{patient.phone}</p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/patient/profile')} className="rounded-xl py-2 cursor-pointer font-bold text-sm">
                                        <User className="ml-3 h-4 w-4 text-blue-600" />
                                        الملف الشخصي
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={signOut} className="rounded-xl py-2 cursor-pointer text-red-600 font-bold text-sm mt-1">
                                        <LogOut className="ml-3 h-4 w-4 text-red-600" />
                                        تسجيل الخروج
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="min-h-[calc(100vh-4rem)]">
                {location.pathname.startsWith('/patient/chat') ? (
                    <Outlet />
                ) : (
                    <div className="container px-4 sm:px-8 py-4 sm:py-6 mx-auto max-w-7xl pb-24">
                        <Outlet />
                    </div>
                )}
            </main>

            {/* Footer */}
            <Footer />

            {/* 💎 Mobile Navigation Bar - Compressed & Optimized for Small Screens */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
                <nav className="h-[72px] bg-white/95 dark:bg-black/90 backdrop-blur-3xl border-t-2 border-orange-500 shadow-[0_-15px_60px_rgba(0,0,0,0.1)] flex justify-between items-center px-1 pb-1">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isTrulyActive = item.path === '/patient/dashboard' 
                            ? location.pathname === '/patient/dashboard' 
                            : location.pathname.includes(item.path);
                        
                        const isMain = index === 2; // "Home" icon center focus

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-1 flex-col items-center justify-center transition-all duration-300 relative min-w-0",
                                    isMain ? "-mt-8" : "mt-2",
                                    isTrulyActive ? "scale-105" : "opacity-80 hover:opacity-100"
                                )}
                            >
                                {/* Icon Container - Compressed */}
                                <div className={cn(
                                    "relative transition-all duration-500 flex items-center justify-center",
                                    isMain 
                                        ? "h-14 w-14 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-orange-400 shadow-[0_8px_25px_rgba(249,115,22,0.4)] border-4 border-white dark:border-zinc-900 active:scale-95"
                                        : "p-2 rounded-xl transition-all duration-300",
                                    !isMain && isTrulyActive && "bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-500/50 shadow-sm"
                                )}>
                                    {isMain && (
                                        <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-20" />
                                    )}
                                    <Icon
                                        className={cn(
                                            "transition-all duration-300 stroke-[2.5]",
                                            isMain 
                                                ? "h-7 w-7 text-white" 
                                                : isTrulyActive ? "h-5 w-5 text-orange-600" : "h-4.5 w-4.5 text-blue-700/70"
                                        )}
                                    />
                                </div>

                                {/* Label - Micro-Typography for better fit */}
                                {!isMain ? (
                                    <span className={cn(
                                        "text-[8px] sm:text-[9px] font-black mt-0.5 transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-0.5",
                                        isTrulyActive ? "text-orange-600" : "text-blue-900/60"
                                    )}>
                                        {item.label}
                                    </span>
                                ) : (
                                    <span className="text-[9px] font-extrabold mt-0.5 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full shadow-sm">
                                        {item.label}
                                    </span>
                                )}

                                {/* Dot Indicator */}
                                {!isMain && isTrulyActive && (
                                    <div className="absolute -bottom-0.5 h-1 w-1 bg-orange-600 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

