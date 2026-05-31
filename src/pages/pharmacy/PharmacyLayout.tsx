import { useState, useCallback } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePharmacyAuth } from '@/hooks/usePharmacyAuth';
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
    FileText,
    Bell,
    User,
    LogOut,
    MessageCircle,
    Pill
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Footer from '@/components/Footer';

export default function PharmacyLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { pharmacy, signOut, loading, token } = usePharmacyAuth(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/pharmacy/dashboard', label: 'الرئيسية', icon: Home },
        { path: '/pharmacy/prescriptions', label: 'الوصفات', icon: Pill },
        { path: '/pharmacy/messages', label: 'الرسائل', icon: MessageCircle },
        { path: '/pharmacy/profile', label: 'حسابي', icon: User },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!pharmacy) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-white/70 backdrop-blur-3xl shadow-sm transition-all duration-300">
                <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 mx-auto max-w-7xl">
                    
                    {/* 📱 Mobile Layout (lg:hidden) */}
                    <div className="flex lg:hidden items-center justify-between w-full gap-2 min-w-0" dir="rtl">
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-2 ring-green-100 hover:ring-green-200 transition-all">
                                        <Avatar className="h-full w-full">
                                            {pharmacy?.avatar ? (
                                                <img src={pharmacy.avatar} alt="Avatar" className="object-cover" />
                                            ) : (
                                                <AvatarFallback className="bg-green-50 text-green-700 font-bold text-xs">
                                                    {pharmacy?.name?.charAt(0) || <User className="h-4 w-4" />}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56" dir="rtl">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none truncate">{pharmacy?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground truncate">{pharmacy?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/pharmacy/profile')} className="cursor-pointer gap-2">
                                        <User className="h-4 w-4" />
                                        <span>حسابي</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={signOut} className="text-red-600 cursor-pointer gap-2 focus:text-red-600">
                                        <LogOut className="h-4 w-4" />
                                        <span>تسجيل الخروج</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-600" onClick={() => navigate('/pharmacy/notifications')}>
                                <Bell className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="flex items-center justify-end min-w-0 pr-2">
                            <h1 className="text-lg font-black tracking-tight text-slate-800 truncate">صيدلية <span className="text-green-600">حكيم</span></h1>
                        </div>
                    </div>

                    {/* 💻 Desktop Layout (hidden lg:flex) */}
                    <div className="hidden lg:flex items-center justify-between w-full" dir="rtl">
                        <div className="flex items-center gap-6">
                            <Link to="/pharmacy/dashboard" className="flex items-center gap-2 shrink-0">
                                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                                    <Pill className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-black tracking-tight text-slate-800">صيدلية <span className="text-green-600">حكيم</span></span>
                            </Link>
                            
                            <nav className="flex items-center gap-1.5 mr-6">
                                {navItems.map((item) => {
                                    const isActive = location.pathname.startsWith(item.path);
                                    return (
                                        <Link key={item.path} to={item.path}>
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    "rounded-xl h-10 px-4 text-sm font-semibold transition-all duration-300 gap-2",
                                                    isActive 
                                                        ? "bg-green-50 text-green-700 shadow-sm ring-1 ring-green-100/50" 
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-green-600"
                                                )}
                                            >
                                                <item.icon className={cn("h-4 w-4", isActive ? "text-green-600" : "")} />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-xl bg-white/50 hover:bg-white border-slate-200 shadow-sm" onClick={() => navigate('/pharmacy/notifications')}>
                                <Bell className="h-4 w-4 text-slate-600" />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 overflow-hidden ring-2 ring-green-100 hover:ring-green-200 transition-all shadow-sm">
                                        <Avatar className="h-full w-full">
                                            {pharmacy?.avatar ? (
                                                <img src={pharmacy.avatar} alt="Avatar" className="object-cover" />
                                            ) : (
                                                <AvatarFallback className="bg-gradient-to-br from-green-50 to-green-100 text-green-700 font-bold">
                                                    {pharmacy?.name?.charAt(0) || <User className="h-4 w-4" />}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56" dir="rtl">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none truncate">{pharmacy?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground truncate">{pharmacy?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/pharmacy/profile')} className="cursor-pointer gap-2">
                                        <User className="h-4 w-4" />
                                        <span>حسابي</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={signOut} className="text-red-600 cursor-pointer gap-2 focus:text-red-600">
                                        <LogOut className="h-4 w-4" />
                                        <span>تسجيل الخروج</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-around p-2" dir="rtl">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link key={item.path} to={item.path} className="w-full flex justify-center">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "flex-col gap-1 h-14 w-full max-w-[4rem] px-0 rounded-2xl transition-all duration-300",
                                        isActive ? "text-green-600 bg-green-50" : "text-slate-500 hover:text-green-600 hover:bg-slate-50"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 transition-transform duration-300", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className={cn("text-[10px] tracking-tight transition-all duration-300", isActive ? "font-bold" : "font-medium")}>
                                        {item.label}
                                    </span>
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-24 lg:pb-12 space-y-6">
                <Outlet />
            </main>

            {/* Footer (Hidden on mobile) */}
            <div className="hidden lg:block">
                <Footer />
            </div>
        </div>
    );
}
