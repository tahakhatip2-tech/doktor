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
        { path: '/patient/appointments', label: 'مواعيدي', icon: Calendar },
        { path: '/patient/messages', label: 'رسائلي', icon: MessageCircle },
        { path: '/patient/clinics', label: 'العيادات', icon: Building2 }, // Center
        { path: '/patient/medical-records', label: 'سجلاتي', icon: FileText },
        { path: '/patient/notifications', label: 'الإشعارات', icon: Bell, badge: unreadCount },
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
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/40 backdrop-blur-[100px] shadow-none transition-all duration-300">
                <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 mx-auto max-w-7xl">
                    {/* Left: Branding */}
                    <Link to="/patient/dashboard" className="flex items-center gap-2 outline-none group">
                        <div className="relative flex-shrink-0">
                            <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 to-orange-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition duration-500" />
                            <div className="relative h-11 w-11 rounded-full p-0.5 border-2 border-white/50 dark:border-blue-900/50 bg-white shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
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
                            <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 bg-clip-text text-transparent transform group-hover:scale-[1.02] transition-transform origin-left">
                                DOCTOR JO
                            </h1>
                            <p className="text-[7px] font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent truncate w-full mt-0.5 text-left">Clinic Management System</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation (Hidden on Mobile) */}
                    <nav className="hidden lg:flex items-center gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link key={item.path} to={item.path}>
                                    <Button
                                        variant={isActive ? 'default' : 'ghost'}
                                        size="sm"
                                        className={cn(
                                            'relative rounded-2xl h-9 px-4 font-bold text-xs transition-all duration-300',
                                            isActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'text-muted-foreground hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20'
                                        )}
                                    >
                                        <Icon className="h-4 w-4 ml-2" />
                                        {item.label}
                                        {item.badge && item.badge > 0 && (
                                            <span className="absolute -top-1.5 -left-1.5 h-4 w-4 bg-orange-500 text-white flex items-center justify-center rounded-full text-[9px] font-black shadow-sm">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right: Actions & User Menu */}
                    <div className="flex items-center gap-2 sm:gap-3" dir="rtl">

                        {/* Profile Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative outline-none group active:scale-95 transition-transform duration-300">
                                    <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full blur-sm opacity-30 group-hover:opacity-50 transition duration-500" />
                                    <div className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white overflow-hidden shadow-lg border-2 border-white dark:border-background">
                                        <Avatar className="h-full w-full bg-transparent">
                                            <AvatarFallback className="bg-transparent text-white font-bold">
                                                {patient.fullName?.charAt(0) || 'م'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 bg-white dark:bg-background rounded-full flex flex-col items-center justify-center gap-[1.5px] border-2 border-white dark:border-background shadow-lg group-hover:scale-110 transition-transform">
                                        <div className="w-2.5 h-[1.5px] bg-blue-600 rounded-full"></div>
                                        <div className="w-1.5 h-[1.5px] bg-blue-600 rounded-full"></div>
                                        <div className="w-2.5 h-[1.5px] bg-blue-600 rounded-full"></div>
                                        <div className="absolute -top-0.5 -left-0.5 h-2 w-2">
                                            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                            <div className="relative h-2 w-2 bg-green-500 rounded-full border border-white dark:border-background"></div>
                                        </div>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-3 p-2 rounded-2xl border-blue-100 dark:border-blue-900 bg-white/95 dark:bg-card/95 backdrop-blur-xl shadow-xl animate-in zoom-in-95" sideOffset={8}>
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1 px-1">
                                        <p className="text-sm font-black text-blue-900 dark:text-blue-100">{patient.fullName}</p>
                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider" dir="ltr">{patient.phone || patient.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-blue-50 dark:bg-blue-900/50 my-2" />
                                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-900/20 font-bold text-sm">
                                    <Languages className="ml-3 h-4 w-4 text-blue-600" />
                                    تغيير اللغة
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/patient/profile')} className="rounded-xl py-2 cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-900/20 font-bold text-sm mt-1">
                                    <User className="ml-3 h-4 w-4 text-blue-600" />
                                    الملف الشخصي
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={signOut} className="rounded-xl py-2 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20 text-red-600 font-bold text-sm mt-1">
                                    <LogOut className="ml-3 h-4 w-4 text-red-600" />
                                    تسجيل الخروج
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Notifications */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/patient/notifications')}
                            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 shadow-sm transition-transform active:scale-95 relative mr-1 sm:mr-2"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-background shadow-md animate-bounce">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="min-h-[calc(100vh-16rem)]">
                <div className="container px-0 sm:px-8 py-0 sm:py-6">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <div className="pb-20 lg:pb-4">
                <Footer />
            </div>

            {/* Mobile Bottom Navigation Bar (App-like) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border z-50 px-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-around h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex flex-col items-center justify-center w-full h-full gap-1"
                            >
                                <div className={cn(
                                    "relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                                    isActive ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" : "text-muted-foreground"
                                )}>
                                    <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                                    {item.badge && item.badge > 0 && (
                                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-orange-500 text-white flex items-center justify-center rounded-full text-[8px] font-black border border-background">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-bold transition-colors",
                                    isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

