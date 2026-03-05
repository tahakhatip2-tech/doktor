import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Clock, Calendar, Volume2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
// We'll use native SpeechSynthesis for simplicity

const QueueDisplay = () => {
    const navigate = useNavigate();
    const [lastCalledId, setLastCalledId] = useState<number | null>(null);

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch today's appointments
    const fetchTodayAppointments = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/appointments/today`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
    };

    // Re-bind query to custom fetch
    const { data: todayApps, isLoading: loadingApps } = useQuery({
        queryKey: ['queueToday'],
        queryFn: fetchTodayAppointments,
        refetchInterval: 5000
    });

    // Helper to normalize status for comparison
    const normalizeStatus = (status: string | undefined | null) => {
        return (status || '').toLowerCase().trim();
    };

    const currentPatient = todayApps?.find((a: any) => {
        const s = normalizeStatus(a.status);
        return s === 'in-progress' || s === 'in_progress';
    });

    const waitingPatients = todayApps?.filter((a: any) => {
        const s = normalizeStatus(a.status);
        return ['scheduled', 'confirmed', 'pending', 'new'].includes(s);
    }).slice(0, 5) || [];

    // Speech Logic
    useEffect(() => {
        if (currentPatient && currentPatient.id !== lastCalledId) {
            setLastCalledId(currentPatient.id);

            // Play chime (optional, simplified to just speech for now)
            setTimeout(() => {
                const text = `الرجاط، من المرظٹضطŒ ${currentPatient.customerName || currentPatient.contact?.name || 'المرظٹض'}طŒ الطھظˆجه إلى ط؛رظپة الطبيب`;
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'ar-SA';
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }, 1000);
        }
    }, [currentPatient, lastCalledId]);


    if (loadingApps) return <div className="h-screen flex items-center justify-center bg-black text-white"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white p-6 overflow-hidden flex flex-col" dir="rtl">

            {/* Top Bar */}
            <div className="flex justify-between items-center mb-8 bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-4">
                    <img src="./logo.png" className="w-16 h-16 object-contain" alt="Logo" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">عظٹادة د. حظƒظٹم</h1>
                        <p className="text-gray-400">نظام الدظˆر الذظƒظٹ</p>
                    </div>
                </div>
                <div className="text-left">
                    <div className="text-4xl font-black font-mono text-primary tracking-widest">
                        {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                    <div className="text-gray-400 flex items-center justify-end gap-2 text-lg">
                        <Calendar className="w-5 h-5" />
                        {currentTime.toLocaleDateString('ar-JO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">

                {/* Right Side: Current Patient (Focus) */}
                <div className="flex flex-col gap-6">
                    <Card className="flex-1 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 border-2 relative overflow-hidden flex flex-col justify-center items-center text-center shadow-[0_0_50px_rgba(29,78,216,0.3)] animate-pulse-slow">
                        <div className="absolute top-0 w-full bg-primary/20 p-2 text-primary font-bold tracking-[0.5em] text-sm uppercase">Now Serving</div>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-30 animate-pulse"></div>
                            <Avatar className="w-48 h-48 border-8 border-primary/50 shadow-2xl">
                                <AvatarImage src={currentPatient?.contact?.avatar} />
                                <AvatarFallback className="text-6xl bg-primary text-white font-black"><User className="w-24 h-24" /></AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="space-y-4 z-10">
                            <h2 className="text-3xl text-primary/80 font-bold">المرظٹض الحالظٹ</h2>
                            {currentPatient ? (
                                <h1 className="text-6xl md:text-7xl font-black text-white leading-tight">
                                    {currentPatient.customerName || currentPatient.contact?.name}
                                </h1>
                            ) : (
                                <h1 className="text-5xl text-gray-500 font-bold">لا ظٹظˆجد مرظٹض حالظٹاً</h1>
                            )}
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <Badge className="px-6 py-2 text-xl bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20">
                                    <Volume2 className="w-5 h-5 mr-2 animate-bounce" />
                                    يرجى الدخظˆل للعظٹادة
                                </Badge>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Left Side: Queue List */}
                <div className="bg-white/5 rounded-3xl border border-white/10 p-6 flex flex-col">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                        <Clock className="w-8 h-8 text-orange-500" />
                        قائمة الانتظار
                        <span className="text-sm bg-white/10 px-3 py-1 rounded-full text-gray-300 mr-auto">
                            {waitingPatients.length} مرظٹض
                        </span>
                    </h3>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {waitingPatients.length > 0 ? waitingPatients.map((apt: any, i: number) => (
                            <div key={apt.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-black text-xl border border-orange-500/30">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-gray-200 group-hover:text-white transition-colors">
                                        {apt.customerName || apt.contact?.name}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(apt.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded textxs">
                                            {apt.type}
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight className="text-gray-600 group-hover:text-white transition-transform group-hover:-translate-x-1" />
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                <Clock className="w-20 h-20 mb-4" />
                                <p className="text-xl">لا ظٹظˆجد مرضى في الانتظار</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Footer Control (Hidden mostly, acts as backdoor home) */}
            <div className="absolute bottom-4 left-4 opacity-0 hover:opacity-100 transition-opacity">
                <Button variant="outline" onClick={() => navigate('/')}>Dashboard</Button>
            </div>
        </div>
    );
};

export default QueueDisplay;
