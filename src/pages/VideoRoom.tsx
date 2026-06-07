import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Peer from 'peerjs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, User } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function VideoRoom() {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    // Determine if user is patient or doctor based on route path
    const isPatient = location.pathname.includes('/patient/');
    const tokenKey = isPatient ? 'patient_token' : 'token';

    const [peerId, setPeerId] = useState<string | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [status, setStatus] = useState<'initializing' | 'waiting' | 'connecting' | 'connected' | 'ended'>('initializing');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    
    const peerInstance = useRef<Peer | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const currentCall = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!appointmentId) return;
        initializeRoom();

        return () => {
            endCallLocally();
        };
    }, [appointmentId]);

    useEffect(() => {
        if (status === 'connected') {
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const initializeRoom = async () => {
        try {
            const token = localStorage.getItem(tokenKey);
            if (!token) {
                navigate(isPatient ? '/unified-auth' : '/login');
                return;
            }

            // Get video room ID from backend
            const endpoint = isPatient 
                ? `${API_URL}/patient/appointments/${appointmentId}/video-token`
                : `${API_URL}/appointments/${appointmentId}/video-token`;

            const res = await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                    'bypass-tunnel-reminder': 'true',
                }
            });

            const fetchedRoomId = res.data.videoRoomId;
            setRoomId(fetchedRoomId);

            // Get local media
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStream.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Initialize Peer
            // The doctor creates the room, the patient joins it
            const myPeerId = isPatient ? `${fetchedRoomId}-patient` : `${fetchedRoomId}-doctor`;
            const remotePeerId = isPatient ? `${fetchedRoomId}-doctor` : `${fetchedRoomId}-patient`;
            
            const peer = new Peer(myPeerId, {
                debug: 2,
            });

            peer.on('open', (id) => {
                setPeerId(id);
                setStatus('waiting');

                // كلا الطرفين يحاولان الاتصال بالطرف الآخر عند الدخول
                // هذا يحل مشكلة "من دخل الغرفة أولاً"
                callPeer(peer, remotePeerId, stream);

                if (!isPatient) {
                    // Doctor tells backend that call has started
                    notifyBackendCallStarted(token);
                }
            });

            peer.on('call', (call) => {
                // Incoming call
                call.answer(stream);
                currentCall.current = call;

                call.on('stream', (userVideoStream) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = userVideoStream;
                    }
                    setStatus('connected');
                });

                call.on('close', () => {
                    // Instead of ending call locally, go back to waiting if connection drops
                    setStatus('waiting');
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = null;
                    }
                });
            });

            peerInstance.current = peer;

        } catch (error) {
            console.error('Error initializing video room:', error);
            toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر الوصول للكاميرا والمايكروفون أو الغرفة غير صالحة' });
            setStatus('ended');
        }
    };

    const callPeer = (peer: Peer, remoteId: string, stream: MediaStream) => {
        const call = peer.call(remoteId, stream);
        if (!call) return;
        
        currentCall.current = call;

        call.on('stream', (userVideoStream) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = userVideoStream;
            }
            setStatus('connected');
        });

        call.on('close', () => {
            setStatus('waiting');
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
        });
        
        call.on('error', (err) => {
            console.error('Call error:', err);
            // Ignore error, we will just wait for the other peer to call us
        });
    };

    const notifyBackendCallStarted = async (token: string) => {
        try {
            await axios.post(`${API_URL}/appointments/${appointmentId}/video/start`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to notify start', error);
        }
    };

    const toggleMute = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const endCallLocally = () => {
        setStatus('ended');
        if (currentCall.current) {
            currentCall.current.close();
        }
        if (peerInstance.current) {
            peerInstance.current.destroy();
        }
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
        }
    };

    const returnToApp = () => {
        if (isPatient) {
            navigate(`/patient/appointments/${appointmentId}`);
        } else {
            window.close();
            // Fallback if window.close() is blocked
            navigate('/');
        }
    };

    const handleEndCall = async () => {
        endCallLocally();
        
        // Notify backend to complete the appointment
        try {
            const token = localStorage.getItem(tokenKey);
            const endpoint = isPatient 
                ? null // Usually doctor ends the call to mark it complete, but let's allow backend to just mark ended or we only let doctor do it
                : `${API_URL}/appointments/${appointmentId}/video/end`;
                
            if (endpoint && token) {
                await axios.post(endpoint, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast({ title: 'تم إنهاء المكالمة', description: 'تم اكتمال الاستشارة بنجاح' });
            }
        } catch (error) {
            console.error('Failed to end call on backend', error);
        }

        setTimeout(() => {
            returnToApp();
        }, 1500);
    };

    if (status === 'ended') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
                <div className="text-center p-8 bg-zinc-900 rounded-3xl max-w-md w-full border border-zinc-800 shadow-2xl">
                    <PhoneOff className="w-16 h-16 mx-auto mb-6 text-rose-500" />
                    <h2 className="text-2xl font-bold mb-2">انتهت المكالمة</h2>
                    <p className="text-zinc-400 mb-8">مدة المكالمة: {formatTime(callDuration)}</p>
                    <Button 
                        onClick={returnToApp}
                        className="w-full bg-primary hover:bg-primary/90 rounded-full h-12"
                    >
                        العودة للموعد
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-full bg-zinc-950 overflow-hidden flex flex-col items-center justify-center font-cairo" dir="rtl">
            {/* Remote Video (Main) */}
            <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                {status !== 'connected' ? (
                    <div className="flex flex-col items-center justify-center text-zinc-500 animate-pulse">
                        <User className="w-32 h-32 mb-4 opacity-20" />
                        <p className="text-xl font-medium tracking-wide">
                            {status === 'initializing' ? 'جاري الاتصال بالغرفة...' : 
                             status === 'waiting' ? (isPatient ? 'في انتظار انضمام الطبيب...' : 'في انتظار انضمام المريض...') :
                             'جاري التوصيل...'}
                        </p>
                        {status === 'waiting' && (
                            <Loader2 className="w-8 h-8 animate-spin mt-4 opacity-50" />
                        )}
                    </div>
                ) : (
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Local Video (PiP) */}
            <div className={cn(
                "absolute top-6 left-6 w-32 md:w-48 aspect-[3/4] md:aspect-video bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-zinc-700/50 transition-all duration-500 z-10",
                isVideoOff && "bg-zinc-900"
            )}>
                <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={cn(
                        "w-full h-full object-cover mirror",
                        isVideoOff && "hidden"
                    )}
                    style={{ transform: 'scaleX(-1)' }}
                />
                {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                        <User className="w-12 h-12" />
                    </div>
                )}
            </div>

            {/* Top Bar Info */}
            {status === 'connected' && (
                <div className="absolute top-6 right-6 z-10 flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-mono font-medium tracking-wider">{formatTime(callDuration)}</span>
                </div>
            )}

            {/* Controls Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-full shadow-2xl">
                <Button
                    onClick={toggleMute}
                    variant="outline"
                    size="icon"
                    className={cn(
                        "rounded-full w-14 h-14 border-0 transition-all duration-300",
                        isMuted ? "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30" : "bg-white/10 text-white hover:bg-white/20"
                    )}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>

                <Button
                    onClick={toggleVideo}
                    variant="outline"
                    size="icon"
                    className={cn(
                        "rounded-full w-14 h-14 border-0 transition-all duration-300",
                        isVideoOff ? "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30" : "bg-white/10 text-white hover:bg-white/20"
                    )}
                >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
                </Button>

                <Button
                    onClick={handleEndCall}
                    variant="destructive"
                    className="rounded-full w-24 h-14 shadow-lg hover:shadow-rose-500/20 hover:bg-rose-600 transition-all duration-300"
                >
                    <PhoneOff className="w-6 h-6 mr-2" />
                    إنهاء
                </Button>
            </div>
        </div>
    );
}
