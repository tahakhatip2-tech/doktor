import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientSocketNotifications } from '@/hooks/usePatientSocketNotifications';
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

    // Real-time notifications for patient via Socket.io
    usePatientSocketNotifications(() => {
        // Re-fetch unread count when a new notification arrives
        fetchUnreadCount();
    });

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
        { path: '/patient/dashboard', label: 'الرئيسية', icon: Home },
        { path: '/patient/appointments', label: 'مواعيدي', icon: Calendar },
        { path: '/patient/offers', label: 'العروض', icon: Tag },
        { path: '/patient/clinics', label: 'العيادات', icon: Building2 },
        { path: '/patient/messages', label: 'رسائلي', icon: MessageCircle },
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
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-md shadow-sm transition-all duration-300">
                <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 mx-auto max-w-7xl">
                    {/* Left: Branding */}
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
                    <nav className="hidden lg:flex items-center gap-1 bg-muted/30 p-1 rounded-2xl border border-border/50">
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

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2" dir="rtl">
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
                            <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-2xl shadow-2xl border-blue-50">
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

            {/* 💎 Ultra Modern Navigation Bar (Mobile) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60]">
                <nav className="bg-white/95 backdrop-blur-2xl border-t border-slate-100 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.05)] flex items-center justify-around h-[84px] px-2 pb-safe mb-0">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path) && (item.path !== '/patient' || location.pathname === '/patient' || location.pathname === '/patient/dashboard');
                        
                        // Exact match for dashboard to avoid matching all routes
                        const isTrulyActive = item.path === '/patient/dashboard' 
                            ? location.pathname === '/patient/dashboard' 
                            : location.pathname.includes(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex flex-col items-center justify-center flex-1 h-full group tap-highlight-transparent"
                            >
                                <div className={cn(
                                    "flex flex-col items-center justify-center transition-all duration-500 ease-out",
                                    isTrulyActive ? "transform -translate-y-3" : "hover:-translate-y-1"
                                )}>
                                    {/* Icon Container */}
                                    <div className={cn(
                                        "relative flex items-center justify-center w-[54px] h-[54px] rounded-2xl transition-all duration-300",
                                        isTrulyActive 
                                            ? "bg-gradient-to-tr from-blue-600 via-blue-700 to-blue-500 shadow-[0_10px_20px_-8px_rgba(37,99,235,0.6)] border border-blue-400/20" 
                                            : "bg-transparent text-slate-400"
                                    )}>
                                        <Icon className={cn(
                                            "h-[22px] w-[22px] transition-all duration-300", 
                                            isTrulyActive ? "text-white" : "group-hover:text-blue-500"
                                        )} strokeWidth={isTrulyActive ? 2.5 : 2} />
                                        
                                        {/* Orange Accent Dot */}
                                        {isTrulyActive && (
                                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-white shadow-sm ring-1 ring-orange-500/20" />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span className={cn(
                                        "absolute -bottom-6 text-[11px] font-bold whitespace-nowrap transition-all duration-300",
                                        isTrulyActive ? "text-blue-800 opacity-100" : "text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-400"
                                    )}>
                                        {item.label}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

