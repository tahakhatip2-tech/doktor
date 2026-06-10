import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface IncomingCallOverlayProps {
    call: {
        appointmentId: number;
        doctorName: string;
        videoRoomId: string;
        message: string;
    } | null;
    onDismiss: () => void;
}

export default function IncomingCallOverlay({ call, onDismiss }: IncomingCallOverlayProps) {
    const navigate = useNavigate();
    const audioCtxRef = useRef<AudioContext | null>(null);
    const ringtoneIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds timeout

    // Generate a ringtone using Web Audio API (no external file needed)
    const startRingtone = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;

            const playBeep = () => {
                if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
                
                const oscillator = audioCtxRef.current.createOscillator();
                const gainNode = audioCtxRef.current.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtxRef.current.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtxRef.current.currentTime);
                oscillator.frequency.setValueAtTime(1100, audioCtxRef.current.currentTime + 0.15);
                
                gainNode.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.4, audioCtxRef.current.currentTime + 0.05);
                gainNode.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.35);
                
                oscillator.start(audioCtxRef.current.currentTime);
                oscillator.stop(audioCtxRef.current.currentTime + 0.35);
            };

            // Play immediately and repeat every 1.5 seconds
            playBeep();
            ringtoneIntervalRef.current = setInterval(playBeep, 1500);
        } catch {
            // ignore audio errors
        }
    };

    const stopRingtone = () => {
        if (ringtoneIntervalRef.current) {
            clearInterval(ringtoneIntervalRef.current);
            ringtoneIntervalRef.current = null;
        }
        if (audioCtxRef.current) {
            try {
                audioCtxRef.current.close();
            } catch { /* ignore */ }
            audioCtxRef.current = null;
        }
    };

    useEffect(() => {
        if (!call) return;

        setTimeLeft(30);
        startRingtone();

        // Countdown timer
        const countdownInterval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    handleDismiss();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(countdownInterval);
            stopRingtone();
        };
    }, [call]);

    const handleAccept = () => {
        stopRingtone();
        onDismiss();
        navigate(`/patient/appointments/${call!.appointmentId}/video`);
    };

    const handleDismiss = () => {
        stopRingtone();
        onDismiss();
    };

    return (
        <AnimatePresence>
            {call && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md"
                    />

                    {/* Call Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7, y: -80 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7, y: -80 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
                        dir="rtl"
                    >
                        <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
                            
                            {/* Top gradient bar */}
                            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

                            {/* Header */}
                            <div className="pt-8 pb-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2 text-emerald-400">
                                    <Video className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">مكالمة فيديو واردة</span>
                                </div>

                                {/* Animated Avatar with pulsing rings */}
                                <div className="relative flex items-center justify-center my-6">
                                    {/* Pulsing rings */}
                                    <div className="absolute w-32 h-32 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '1.5s' }} />
                                    <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }} />
                                    
                                    {/* Avatar */}
                                    <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl border-4 border-white/20">
                                        <span className="text-white text-3xl font-black">
                                            {call.doctorName?.charAt(0) || 'د'}
                                        </span>
                                    </div>
                                </div>

                                <h2 className="text-2xl font-black text-white mb-1">
                                    {call.doctorName}
                                </h2>
                                <p className="text-slate-400 text-sm font-medium">
                                    {call.message}
                                </p>

                                {/* Countdown */}
                                <div className="mt-3 flex justify-center">
                                    <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                        ينتهي خلال {timeLeft} ثانية
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-6 pb-8 flex gap-4">
                                {/* Decline */}
                                <Button
                                    onClick={handleDismiss}
                                    className="flex-1 h-14 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold gap-2 transition-all duration-200 active:scale-95"
                                    variant="ghost"
                                >
                                    <PhoneOff className="w-5 h-5" />
                                    رفض
                                </Button>

                                {/* Accept */}
                                <Button
                                    onClick={handleAccept}
                                    className="flex-1 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold gap-2 shadow-lg shadow-emerald-500/30 transition-all duration-200 active:scale-95 border-0"
                                >
                                    <Phone className="w-5 h-5" />
                                    قبول
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
