import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toastWithSound } from "@/lib/toast-with-sound";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { useAuth } from "@/hooks/useAuth";
import { useContacts } from "@/hooks/useContacts";
import { useTheme } from "@/hooks/useTheme";
import { TemplatesManager } from "@/components/TemplatesManager";
import AppointmentsCalendar from "@/components/AppointmentsCalendar";
import { PatientCard } from "@/components/PatientCard";
import { PatientDetails } from "./PatientDetails";
import InternalChat from "./InternalChat";
import WhatsAppBot from "./WhatsAppBot";
import { MedicalStatsCard } from "@/components/MedicalStatsCard";
import { AutoReplyToggle } from "@/components/AutoReplyToggle";
import { UpcomingAppointments } from "@/components/UpcomingAppointments";
import { ClinicProvider } from "@/context/ClinicContext";
import ClinicSettings from "@/components/ClinicSettings";
import { ClinicStats } from "@/components/ClinicStats";
import OffersManager from "@/components/OffersManager";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { PatientCardSkeleton } from "@/components/skeletons/PatientCardSkeleton";
import HeroSection from "@/components/HeroSection";
import { appointmentsApi, whatsappApi, dataApi } from "@/lib/api";
import {
    Users,
    CheckCircle2,
    Clock,
    TrendingUp,
    MessageCircle,
    Calendar,
    Search,
    RefreshCw,
    ArrowRight,
    ArrowLeft,
    LayoutDashboard,
    FileText,
    Settings,
    LineChart,
    Sparkles,
    Download,
    Tag
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<any>(null); // New State
    const { theme, toggleTheme } = useTheme();
    const { contacts, isLoading: contactsLoading, exportContacts, deleteContact, updateStatus, syncContacts } = useContacts();

    const [stats, setStats] = useState<any>(null);
    const [aiSettings, setAiSettings] = useState<any>(null);
    const [upcomingAppointmentsList, setUpcomingAppointmentsList] = useState<any[]>([]);
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [patientSearchTerm, setPatientSearchTerm] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [scrollProgress, setScrollProgress] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemsPerPage = 8;

    // Onboarding Tutorial State
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Check for new user on mount
    useEffect(() => {
        const isNewUser = localStorage.getItem('isNewUser');
        if (isNewUser === 'true' && user) {
            setShowOnboarding(true);
        }
    }, [user]);

    const handleOnboardingComplete = () => {
        localStorage.removeItem('isNewUser');
        localStorage.setItem('onboardingCompleted', 'true');
        setShowOnboarding(false);
    };

    const handleOnboardingSkip = () => {
        localStorage.removeItem('isNewUser');
        setShowOnboarding(false);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const progress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
        setScrollProgress(progress);
    };

    const filteredContacts = (contacts || []).filter((c: any) =>
        (c.name?.toLowerCase().includes(patientSearchTerm.toLowerCase())) ||
        (c.phone?.includes(patientSearchTerm))
    );

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const now = new Date();
                const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const [statsData, settingsData, upcomingData] = await Promise.all([
                    appointmentsApi.getStats(),
                    whatsappApi.getSettings(),
                    dataApi.get(`/appointments?date_from=${today}`)
                ]);
                setStats(statsData);
                setAiSettings(settingsData);
                setUpcomingAppointmentsList(upcomingData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsDashboardLoading(false);
            }
        };

        if (user && activeTab === 'dashboard') {
            fetchDashboardData();
        }
    }, [user, activeTab]);

    const handleToggleAutoReply = async (active: boolean) => {
        try {
            await whatsappApi.updateSettings({ ...aiSettings, ai_enabled: active ? '1' : '0' });
            setAiSettings(prev => ({ ...prev, ai_enabled: active ? '1' : '0' }));
        } catch (error) {
            console.error('Error toggling auto-reply:', error);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/auth");
        }
    }, [user, authLoading, navigate]);

    const handleSignOut = async () => {
        await signOut();
        navigate("/auth");
    };

    if (authLoading) {
        return (
            <div className="flex h-screen w-full bg-[#f8f9fc] dark:bg-black/95 font-cairo" dir="rtl">
                <aside className="hidden md:block w-80 border-l border-border/50 bg-card/50 sticky top-0 h-screen">
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="animate-pulse flex flex-col items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-muted/50" />
                            <div className="h-4 w-32 bg-muted/50 rounded" />
                        </div>
                    </div>
                </aside>
                <div className="flex-1 flex flex-col p-8">
                    <DashboardSkeleton />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">جاري التحويل...</p>
            </div>
        );
    }

    // Handle viewing patient details
    const handleViewPatientDetails = (contact: any) => {
        setSelectedPatientForDetails(contact);
        setActiveTab('patient-details');
    };

    return (
        <div className="flex h-screen w-full bg-[#f8f9fc] dark:bg-black/95 overflow-hidden font-cairo" dir="rtl">
            <ClinicProvider>
                {/* Sidebar Area (Desktop) */}
                <aside className="hidden md:block w-80 flex-shrink-0 border-l border-border/50 bg-card/50 backdrop-blur-xl z-50 sticky top-0 h-screen">
                    <Sidebar activeTab={activeTab === 'patient-details' ? 'contacts' : activeTab} setActiveTab={setActiveTab} />
                </aside>

                {/* Main Content Area */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar pb-24 md:pb-0 scroll-smooth"
                >
                    <div className="sticky top-0 z-[51] w-full">
                        <Header
                            onNavigate={(path) => navigate(path)}
                            onTabChange={(tab) => setActiveTab(tab)}
                            activeTab={activeTab}
                        />
                        {/* Scroll Progress Bar */}
                        <div className="absolute bottom-0 left-0 h-[2px] bg-primary z-50 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
                    </div>

                    {/* Scrollable Content */}
                    <main className="flex-1 p-4 md:p-10">
                        <div className="max-w-7xl mx-auto">
                            {/* Dynamic Hero Section */}
                            {activeTab !== 'patient-details' && activeTab !== 'whatsapp-bot' && activeTab !== 'internal-chat' && (
                                <HeroSection
                                    doctorName={user?.name ? `د. ${user.name}` : 'د. حكيم'}
                                    pageTitle={
                                        activeTab === 'dashboard' ? "لوحة التحكم الرئيسية" :
                                            activeTab === 'contacts' ? "إدارة المرضى والمراجعات" :
                                                activeTab === 'appointments' ? "جدول المواعيد والزيارات" :
                                                    activeTab === 'templates' ? "قوالب الردود التلقائية" :
                                                        activeTab === 'clinic-settings' ? "إعدادات العيادة" :
                                                            activeTab === 'bot-stats' ? "إحصائيات الذكاء الاصطناعي" : "نظام الطبيب"
                                    }
                                    description={
                                        activeTab === 'dashboard' ? "إليك موجز سريع لأداء عيادتك اليوم والمهام القادمة" :
                                            activeTab === 'contacts' ? "قاعدة بيانات شاملة لمرضاك مع سجلاتهم الطبية وحالاتهم" :
                                                activeTab === 'appointments' ? "نظرة شاملة على جميع المواعيد المحجوزة والقدرة على جدولتها" :
                                                    activeTab === 'templates' ? "تحكم في الرسائل الجاهزة والردود الآلية لتوفير وقتك" :
                                                        activeTab === 'clinic-settings' ? "تعديل بيانات العيادة وشعارها بما يتناسب مع هويتك" :
                                                            activeTab === 'offers' ? "إدارة وتوزيع عروضك وتخفيضاتك الطبية" :
                                                                activeTab === 'bot-stats' ? "تحليل دقيق لتفاعلات المرضى مع المساعد الذكي الخاص بك" : "إدارة طبية متكاملة"
                                    }
                                    icon={
                                        activeTab === 'dashboard' ? LayoutDashboard :
                                            activeTab === 'contacts' ? Users :
                                                activeTab === 'appointments' ? Calendar :
                                                    activeTab === 'templates' ? FileText :
                                                        activeTab === 'clinic-settings' ? Settings :
                                                            activeTab === 'offers' ? Tag :
                                                                activeTab === 'bot-stats' ? LineChart : Sparkles
                                    }
                                />
                            )}

                            {activeTab === 'dashboard' && (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: {
                                            opacity: 1,
                                            transition: { staggerChildren: 0.12, delayChildren: 0.2 }
                                        }
                                    }}
                                    className="space-y-8 md:space-y-12 pb-12"
                                >
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                                        <motion.div
                                            variants={{
                                                hidden: { y: 30, opacity: 0, scale: 0.95 },
                                                visible: {
                                                    y: 0,
                                                    opacity: 1,
                                                    scale: 1,
                                                    transition: { type: "spring", stiffness: 100, damping: 20 }
                                                }
                                            }}
                                        >
                                            <MedicalStatsCard
                                                title="مرضى اليوم"
                                                value={stats?.today_total || 0}
                                                subtitle="إجمالي المواعيد"
                                                icon={Users}
                                                color="blue"
                                                backgroundImage="/stats-bg-1.png"
                                            />
                                        </motion.div>
                                        <motion.div
                                            variants={{
                                                hidden: { y: 30, opacity: 0, scale: 0.95 },
                                                visible: {
                                                    y: 0,
                                                    opacity: 1,
                                                    scale: 1,
                                                    transition: { type: "spring", stiffness: 100, damping: 20 }
                                                }
                                            }}
                                        >
                                            <MedicalStatsCard
                                                title="حضر"
                                                value={stats?.today_completed || 0}
                                                subtitle="مريض حضر"
                                                icon={CheckCircle2}
                                                color="blue"
                                                backgroundImage="/stats-bg-1.png"
                                            />
                                        </motion.div>
                                        <motion.div
                                            variants={{
                                                hidden: { y: 30, opacity: 0, scale: 0.95 },
                                                visible: {
                                                    y: 0,
                                                    opacity: 1,
                                                    scale: 1,
                                                    transition: { type: "spring", stiffness: 100, damping: 20 }
                                                }
                                            }}
                                        >
                                            <MedicalStatsCard
                                                title="في الانتظار"
                                                value={stats?.today_waiting || 0}
                                                subtitle="مريض منتظر"
                                                icon={Clock}
                                                color="orange"
                                                backgroundImage="/stats-bg-1.png"
                                            />
                                        </motion.div>
                                        <motion.div
                                            variants={{
                                                hidden: { y: 30, opacity: 0, scale: 0.95 },
                                                visible: {
                                                    y: 0,
                                                    opacity: 1,
                                                    scale: 1,
                                                    transition: { type: "spring", stiffness: 100, damping: 20 }
                                                }
                                            }}
                                        >
                                            <MedicalStatsCard
                                                title="معدل الحضور"
                                                value={stats?.today_total > 0 ? `${Math.round((stats.today_completed / stats.today_total) * 100)}%` : "100%"}
                                                subtitle={stats?.today_total > 0 ? "بناءً على مواعيد اليوم" : "النظام جديد"}
                                                icon={TrendingUp}
                                                color="purple"
                                                backgroundImage="/stats-bg-1.png"
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Professional Divider */}
                                    <div className="w-full flex items-center justify-center gap-4 my-6 opacity-80">
                                        <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                                        <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                                    </div>

                                    <AutoReplyToggle
                                        isActive={true}
                                    />

                                    {/* Professional Divider */}
                                    <div className="w-full flex items-center justify-center gap-4 my-6 opacity-80">
                                        <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                                        <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                                    </div>

                                    <UpcomingAppointments
                                        appointments={upcomingAppointmentsList
                                            .filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed' || apt.status === 'pending')
                                            .map(apt => ({
                                                id: apt.id.toString(),
                                                patientName: apt.customerName || apt.patient_name || apt.customer_name || 'بدون اسم',
                                                time: new Date(apt.appointmentDate || apt.appointment_date || "").toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true }),
                                                date: new Date(apt.appointmentDate || apt.appointment_date || "").toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' }),
                                                type: (apt.type || apt.appointment_type) === 'consultation' ? 'استشارة' : (apt.type || apt.appointment_type),
                                                status: apt.status === 'scheduled' ? 'scheduled' : apt.status === 'confirmed' ? 'confirmed' : 'waiting'
                                            }))}
                                        onViewAll={() => setActiveTab('appointments')}
                                    />

                                    {/* Professional Divider */}
                                    <div className="w-full flex items-center justify-center gap-4 my-6 opacity-80">
                                        <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                                        <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                                    </div>

                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0 },
                                            visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
                                        }}
                                        initial="hidden"
                                        animate="visible"
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10"
                                    >
                                        <motion.div
                                            variants={{
                                                hidden: { opacity: 0, scale: 0.95 },
                                                visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
                                            }}
                                            whileHover={{ y: -5, scale: 1.01 }}
                                            className="p-4 border border-white/10 bg-white/[0.08] backdrop-blur-[80px] shadow-2xl hover:shadow-primary/20 transition-all duration-700 cursor-pointer group relative overflow-hidden rounded-none mx-2 md:mx-4"
                                            onClick={() => setActiveTab('whatsapp-bot')}
                                        >
                                            <div className="">
                                                {/* Light Sweep */}
                                                <div className="light-sweep opacity-30" />

                                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="h-14 w-14 md:h-16 md:w-16 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center transition-all duration-700 group-hover:bg-primary group-hover:text-white shadow-[0_0_20px_rgba(var(--primary),0.1)] group-hover:shadow-primary/30 rounded-2xl group-hover:rotate-6">
                                                            <MessageCircle className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.5} />
                                                        </div>
                                                        <div className="flex flex-col gap-1 text-right md:text-right">
                                                            <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tighter italic uppercase leading-none group-hover:text-primary transition-colors">إدارة المحادثات</h3>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Live Support Center</span>
                                                                <span className="text-[8px] md:text-[9px] text-primary/60 font-black uppercase tracking-widest opacity-80 mt-0.5">SYST_CHAT_CENTRE</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 shadow-lg shadow-primary/5">
                                                        <ArrowRight className="h-4 w-4 animate-pulse" />
                                                    </div>
                                                </div>

                                                {/* Bottom Professional Accent */}
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 1, delay: 0.8 }}
                                                    className="absolute bottom-0 left-0 flex opacity-40 group-hover:opacity-100 transition-opacity duration-1000"
                                                >
                                                    <div className="h-[3px] w-2/5 bg-primary shadow-[0_0_20px_rgba(var(--primary),0.6)]" />
                                                    <div className="h-[3px] flex-1 bg-white/5" />
                                                </motion.div>

                                                {/* Top Shine */}
                                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            variants={{
                                                hidden: { opacity: 0, scale: 0.95 },
                                                visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
                                            }}
                                            whileHover={{ y: -5, scale: 1.01 }}
                                            className="p-4 border border-white/10 bg-white/[0.08] backdrop-blur-[80px] shadow-2xl hover:shadow-primary/20 transition-all duration-700 cursor-pointer group relative overflow-hidden rounded-none mx-2 md:mx-4"
                                            onClick={() => setActiveTab('appointments')}
                                        >
                                            <div className="">
                                                {/* Light Sweep */}
                                                <div className="light-sweep opacity-30" />

                                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="h-14 w-14 md:h-16 md:w-16 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center transition-all duration-700 group-hover:bg-primary group-hover:text-white shadow-[0_0_20px_rgba(var(--primary),0.1)] group-hover:shadow-primary/30 rounded-2xl group-hover:-rotate-6">
                                                            <Calendar className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.5} />
                                                        </div>
                                                        <div className="flex flex-col gap-1 text-right md:text-right">
                                                            <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tighter italic uppercase leading-none group-hover:text-primary transition-colors">عرض الواجهات</h3>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Show Navigation Panel</span>
                                                                <span className="text-[8px] md:text-[9px] text-primary/60 font-black uppercase tracking-widest opacity-80 mt-0.5">SYST_UI_VIEWS</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 shadow-lg shadow-primary/5">
                                                        <ArrowRight className="h-4 w-4 animate-pulse" />
                                                    </div>
                                                </div>

                                                {/* Bottom Professional Accent */}
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 1, delay: 1 }}
                                                    className="absolute bottom-0 left-0 flex opacity-40 group-hover:opacity-100 transition-opacity duration-1000"
                                                >
                                                    <div className="h-[3px] w-2/5 bg-primary shadow-[0_0_20px_rgba(var(--primary),0.6)]" />
                                                    <div className="h-[3px] flex-1 bg-white/5" />
                                                </motion.div>

                                                {/* Top Shine */}
                                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* New Patient Details View */}
                            {activeTab === 'patient-details' && selectedPatientForDetails && (
                                <PatientDetails
                                    patient={selectedPatientForDetails}
                                    onBack={() => {
                                        setSelectedPatientForDetails(null);
                                        setActiveTab('contacts');
                                    }}
                                    onOpenChat={(phone, name) => {
                                        setSelectedPhone(phone);
                                        setSelectedName(name);
                                        setActiveTab('whatsapp-bot');
                                    }}
                                    onBookAppointment={(phone, name) => {
                                        // Implement booking logic or open booking modal
                                        toastWithSound.success("سيتم إضافة ميزة الحجز السريع قريباً");
                                    }}
                                />
                            )}

                            {activeTab === 'contacts' && (
                                <div className="space-y-6 animate-fade-in pb-10">
                                    {/* Control Bar & Search Section */}
                                    <div className="mb-8 space-y-4">
                                        {/* Blue Glass Control Bar */}
                                        <Card className="p-2 bg-blue-600/5 border border-blue-500/10 backdrop-blur-md rounded-none shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">

                                            <div className="flex items-center gap-2 w-full md:w-auto px-2">
                                                <div className="h-8 px-4 flex items-center justify-center bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                                                    إجمالي المرضى: {(contacts || []).length}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 px-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 gap-2 rounded-none font-bold text-xs uppercase tracking-wide bg-white/5 hover:bg-white/10 text-foreground/80 hover:text-primary border border-white/5 hover:border-white/10 transition-all"
                                                    onClick={() => syncContacts.mutate()}
                                                >
                                                    <RefreshCw className={cn("h-3 w-3", syncContacts.isPending && "animate-spin")} />
                                                    <span>مزامنة</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 gap-2 rounded-none font-bold text-xs uppercase tracking-wide bg-white/5 hover:bg-white/10 text-foreground/80 hover:text-primary border border-white/5 hover:border-white/10 transition-all"
                                                    onClick={exportContacts}
                                                >
                                                    <Download className="h-3 w-3" />
                                                    <span>تصدير</span>
                                                </Button>
                                            </div>
                                        </Card>

                                        {/* Search Input - Sharp & Professional */}
                                        <div className="relative group max-w-2xl mx-auto">
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none group-focus-within:text-primary transition-colors z-10">
                                                <Search className="h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                                            </div>
                                            <Input
                                                className="w-full h-12 pr-12 rounded-none border-x-0 border-t-0 border-b border-border/50 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-primary/50 transition-all text-sm font-medium placeholder:text-muted-foreground/30 text-center focus:text-right hover:bg-blue-500/[0.02] focus:bg-blue-500/[0.02]"
                                                placeholder="ابحث عن مريض بالاسم أو رقم الهاتف..."
                                                value={patientSearchTerm}
                                                onChange={(e) => setPatientSearchTerm(e.target.value)}
                                            />
                                            {/* Bottom Active Line Animation */}
                                            <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-focus-within:w-full transition-all duration-700 mx-auto right-0" />
                                        </div>
                                    </div>

                                    {/* Professional Divider */}
                                    <div className="w-full flex items-center justify-center gap-4 my-6 opacity-80">
                                        <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                                        <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                                    </div>

                                    {contactsLoading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                            {[...Array(8)].map((_, i) => (
                                                <PatientCardSkeleton key={i} />
                                            ))}
                                        </div>
                                    ) : filteredContacts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/50 animate-in fade-in zoom-in duration-700">
                                            <div className="relative mb-6">
                                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                                <Users className="h-20 w-20 text-primary/40 relative z-10" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">لا يوجد مرضى مطابقين</h3>
                                            <p className="text-muted-foreground text-center max-w-sm mb-6">
                                                لم نجد أي مريض يطابق بحثك. تأكد من كتابة الاسم أو الرقم بشكل صحيح، أو قم بمزامنة البيانات.
                                            </p>
                                            <Button variant="outline" className="rounded-full px-8 gap-2 border-primary/20 hover:bg-primary/5" onClick={() => syncContacts.mutate()}>
                                                <RefreshCw className={cn("h-4 w-4", syncContacts.isPending && "animate-spin")} />
                                                مزامنة المرضى الآن
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                                {filteredContacts
                                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                    .map((contact: any) => (
                                                        <PatientCard
                                                            key={contact.id}
                                                            id={contact.id}
                                                            name={contact.name}
                                                            phone={contact.phone}
                                                            last_visit={contact.actual_last_visit || contact.last_visit}
                                                            total_appointments={contact.total_appointments}
                                                            blood_type={contact.blood_type}
                                                            onDelete={(id) => deleteContact.mutate(id)}
                                                            onViewDetails={() => handleViewPatientDetails(contact)} // New Prop
                                                            onOpenChat={(phone) => {
                                                                setSelectedPhone(phone);
                                                                setActiveTab('whatsapp-bot');
                                                            }}
                                                        />
                                                    ))}
                                            </div>

                                            {/* Pagination Buttons - تظهر دائماً إذا كان هناك مرضى أو أكثر من صفحة */}
                                            {filteredContacts.length > 0 && (
                                                <div className="flex items-center justify-center gap-4 mt-12 pb-6">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-full gap-2 px-6 h-10 border-primary/20 text-primary hover:bg-primary/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <ArrowRight className="h-4 w-4" />
                                                        السابق
                                                    </Button>

                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-black text-primary bg-primary/10 w-9 h-9 rounded-full flex items-center justify-center border border-primary/20">
                                                            {currentPage}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground font-bold">
                                                            من {Math.max(1, Math.ceil(filteredContacts.length / itemsPerPage))}
                                                        </span>
                                                    </div>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-full gap-2 px-6 h-10 border-primary/20 text-primary hover:bg-primary/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredContacts.length / itemsPerPage), prev + 1))}
                                                        disabled={currentPage >= Math.ceil(filteredContacts.length / itemsPerPage)}
                                                    >
                                                        التالي
                                                        <ArrowLeft className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'templates' && <TemplatesManager />}

                            {activeTab === 'whatsapp-bot' && (
                                <WhatsAppBot
                                    initialPhone={selectedPhone}
                                    initialName={selectedName}
                                    doctorName={user?.name ? `د. ${user.name}` : 'د. حكيم'}
                                    onBackCleanup={() => {
                                        setSelectedPhone(null);
                                        setSelectedName(null);
                                    }}
                                />
                            )}

                            {activeTab === 'appointments' && <AppointmentsCalendar onOpenChat={(phone) => {
                                setSelectedPhone(phone);
                                setActiveTab('whatsapp-bot');
                            }} />}

                            {activeTab === 'clinic-settings' && <ClinicSettings />}

                            {activeTab === 'bot-stats' && <ClinicStats />}

                            {activeTab === 'offers' && <OffersManager />}

                            {activeTab === 'internal-chat' && (
                                <div className="-mx-4 md:-mx-10 -mt-0">
                                    <InternalChat />
                                </div>
                            )}
                            <Footer />
                        </div>
                    </main>
                </div>

                <BottomNav
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onSearchClick={() => setActiveTab('contacts')}
                />

                {/* Onboarding Tutorial */}
                {showOnboarding && (
                    <OnboardingTutorial
                        onComplete={handleOnboardingComplete}
                        onSkip={handleOnboardingSkip}
                    />
                )}
            </ClinicProvider >
        </div >
    );
};

export default Index;
