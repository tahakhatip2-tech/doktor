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
    Menu,
    X,
    MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

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
        { path: '/patient/clinics', label: 'العيادات', icon: Building2 },
        { path: '/patient/appointments', label: 'مواعيدي', icon: Calendar },
        { path: '/patient/medical-records', label: 'السجلات الطبية', icon: FileText },
        { path: '/patient/notifications', label: 'الإشعارات', icon: Bell, badge: unreadCount },
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
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </Button>
                        <Link to="/patient/dashboard" className="flex items-center gap-3">
                            <div className="relative group cursor-pointer">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full blur opacity-30 animate-pulse group-hover:animate-[pulse_0.5s_ease-in-out_infinite]"></div>
                                <img
                                    src="/hakeem-logo.png"
                                    alt="Doctor Jo Logo"
                                    className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full p-0.5 border-2 border-orange-500 bg-white shadow-xl object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/logo.png';
                                    }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-base sm:text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 bg-clip-text text-transparent">
                                    DOCTOR JO
                                </h1>
                                <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.1em] bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                                    Clinic Management System
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link key={item.path} to={item.path}>
                                    <Button
                                        variant={isActive ? 'default' : 'ghost'}
                                        className={cn(
                                            'relative',
                                            isActive && 'gradient-primary text-white shadow-glow'
                                        )}
                                    >
                                        <Icon className="h-4 w-4 ml-2" />
                                        {item.label}
                                        {item.badge && item.badge > 0 && (
                                            <Badge className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-white">
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar>
                                    <AvatarFallback className="gradient-primary text-white">
                                        {patient.fullName?.charAt(0) || 'م'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{patient.fullName}</p>
                                    <p className="text-xs text-muted-foreground">{patient.phone || patient.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/patient/profile')}>
                                <User className="ml-2 h-4 w-4" />
                                الملف الشخصي
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut} className="text-destructive">
                                <LogOut className="ml-2 h-4 w-4" />
                                تسجيل الخروج
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t bg-background p-4">
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Button
                                            variant={isActive ? 'default' : 'ghost'}
                                            className={cn(
                                                'w-full justify-start relative',
                                                isActive && 'gradient-primary text-white'
                                            )}
                                        >
                                            <Icon className="h-4 w-4 ml-2" />
                                            {item.label}
                                            {item.badge && item.badge > 0 && (
                                                <Badge className="mr-auto bg-destructive text-white">
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="container py-6">
                <Outlet />
            </main>
        </div>
    );
}

