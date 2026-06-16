import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Peer from 'peerjs';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, User,
  FileText, Plus, Trash2, ChevronRight, ChevronLeft, Clock, Upload, X,
  Pill, Check, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Medication {
  name: string;
  type: string;
  frequency: string;
  duration: string;
}

interface PatientFile {
  name: string;
  url: string;
  type: string;
}

export default function VideoRoom() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const isPatient = location.pathname.includes('/patient/');
  const tokenKey = isPatient ? 'patient_token' : 'token';

  // Video state
  const [status, setStatus] = useState<'initializing' | 'waiting' | 'connecting' | 'connected' | 'ended'>('initializing');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Side panel state (doctor only)
  const [showPanel, setShowPanel] = useState(!isPatient);
  const [activeTab, setActiveTab] = useState<'prescription' | 'files'>('prescription');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMed, setNewMed] = useState<Medication>({ name: '', type: 'قرص', frequency: 'مرة يومياً', duration: '7 أيام' });
  const [patientFiles, setPatientFiles] = useState<PatientFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // End call modal state
  const [showEndModal, setShowEndModal] = useState(false);

  // Patient file upload
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstance = useRef<Peer | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const currentCall = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!appointmentId) return;
    initializeRoom();
    return () => endCallLocally();
  }, [appointmentId]);

  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  // Load patient files when panel opens
  useEffect(() => {
    if (!isPatient && appointmentId) fetchPatientFiles();
  }, [appointmentId, isPatient]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const fetchPatientFiles = async () => {
    try {
      const token = localStorage.getItem(tokenKey);
      const res = await axios.get(`${API_URL}/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const files = res.data.patientFiles ? JSON.parse(res.data.patientFiles) : [];
      setPatientFiles(files);
    } catch { /* silent */ }
  };

  const initializeRoom = async () => {
    try {
      const token = localStorage.getItem(tokenKey);
      if (!token) { navigate(isPatient ? '/unified-auth' : '/login'); return; }

      const endpoint = isPatient
        ? `${API_URL}/patient/appointments/${appointmentId}/video-token`
        : `${API_URL}/appointments/${appointmentId}/video-token`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' }
      });

      const fetchedRoomId = res.data.videoRoomId;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const myPeerId = isPatient ? `${fetchedRoomId}-patient` : `${fetchedRoomId}-doctor`;
      const remotePeerId = isPatient ? `${fetchedRoomId}-doctor` : `${fetchedRoomId}-patient`;

      const peer = new Peer(myPeerId, { debug: 2 });

      peer.on('open', () => {
        setStatus('waiting');
        callPeer(peer, remotePeerId, stream);
        if (!isPatient) notifyBackendCallStarted(token);
      });

      peer.on('call', (call) => {
        call.answer(stream);
        currentCall.current = call;
        call.on('stream', (s) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = s;
          setStatus('connected');
        });
        call.on('close', () => {
          setStatus('waiting');
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        });
      });

      peerInstance.current = peer;
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر الوصول للكاميرا أو الغرفة غير صالحة' });
      setStatus('ended');
    }
  };

  const callPeer = (peer: Peer, remoteId: string, stream: MediaStream) => {
    const call = peer.call(remoteId, stream);
    if (!call) return;
    currentCall.current = call;
    call.on('stream', (s) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = s;
      setStatus('connected');
    });
    call.on('close', () => {
      setStatus('waiting');
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    });
    call.on('error', () => { /* ignore, wait for other peer */ });
  };

  const notifyBackendCallStarted = async (token: string) => {
    try {
      await axios.post(`${API_URL}/appointments/${appointmentId}/video/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch { /* silent */ }
  };

  const endCallLocally = () => {
    setStatus('ended');
    currentCall.current?.close();
    peerInstance.current?.destroy();
    localStream.current?.getTracks().forEach(t => t.stop());
  };

  // ─── Prescription helpers ────────────────────────────────────────
  const addMedication = () => {
    if (!newMed.name.trim()) return;
    setMedications(prev => [...prev, { ...newMed }]);
    setNewMed({ name: '', type: 'قرص', frequency: 'مرة يومياً', duration: '7 أيام' });
  };

  const removeMedication = (i: number) => setMedications(prev => prev.filter((_, idx) => idx !== i));

  // ─── End call flow ───────────────────────────────────────────────
  const handleEndCall = () => {
    endCallLocally();
    if (!isPatient) {
      setShowEndModal(true); // Doctor sees modal to write prescription
    } else {
      // Patient just goes back
      navigate(`/patient/appointments/${appointmentId}`);
    }
  };

  const handleCompleteWithPrescription = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem(tokenKey);
      await axios.post(`${API_URL}/appointments/${appointmentId}/video/complete`, {
        diagnosis,
        treatment,
        medications: medications.length > 0 ? medications : undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast({ title: '✅ تم الحفظ', description: 'تم إنهاء الاستشارة وحفظ الوصفة بنجاح' });
      setShowEndModal(false);
      setTimeout(() => navigate('/'), 1200);
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل حفظ الوصفة' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteWithoutPrescription = async () => {
    try {
      const token = localStorage.getItem(tokenKey);
      await axios.post(`${API_URL}/appointments/${appointmentId}/video/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'تم إنهاء الاستشارة' });
    } catch { /* silent */ }
    setShowEndModal(false);
    navigate('/');
  };

  // ─── Patient file upload ─────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const token = localStorage.getItem(tokenKey);
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${API_URL}/patient/appointments/${appointmentId}/upload-file`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast({ title: '✅ تم رفع الملف', description: file.name });
      setPatientFiles(prev => [...prev, { name: file.name, url: res.data.url, type: file.type }]);
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل رفع الملف' });
    } finally {
      setUploadingFile(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // After call ended — show end modal (doctor) or redirect (patient)
  // ─────────────────────────────────────────────────────────────────
  if (status === 'ended' && !showEndModal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white" dir="rtl">
        <div className="text-center p-10 bg-zinc-900 rounded-3xl max-w-md w-full border border-zinc-800 shadow-2xl">
          <PhoneOff className="w-16 h-16 mx-auto mb-6 text-rose-500" />
          <h2 className="text-2xl font-bold mb-2">انتهت المكالمة</h2>
          <p className="text-zinc-400 mb-8">مدة المكالمة: {formatTime(callDuration)}</p>
          <button
            onClick={() => isPatient ? navigate(`/patient/appointments/${appointmentId}`) : navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 font-medium transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-zinc-950 overflow-hidden flex font-cairo" dir="rtl">

      {/* ── Main Video Area ── */}
      <div className={cn("relative flex-1 transition-all duration-300", showPanel && !isPatient ? "mr-0" : "")}>
        {/* Remote Video */}
        <div className="absolute inset-0 flex items-center justify-center">
          {status !== 'connected' ? (
            <div className="flex flex-col items-center text-zinc-500 animate-pulse">
              <User className="w-32 h-32 mb-4 opacity-20" />
              <p className="text-xl font-medium tracking-wide">
                {status === 'initializing' ? 'جاري الاتصال بالغرفة...' :
                  status === 'waiting' ? (isPatient ? 'في انتظار الطبيب...' : 'في انتظار المريض...') : 'جاري التوصيل...'}
              </p>
              {status === 'waiting' && <Loader2 className="w-8 h-8 animate-spin mt-4 opacity-50" />}
            </div>
          ) : (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          )}
        </div>

        {/* Local Video PiP */}
        <div className={cn(
          "absolute top-6 right-6 w-36 md:w-52 aspect-video bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-zinc-700/50 z-10 transition-all duration-500",
          isVideoOff && "bg-zinc-900"
        )}>
          <video ref={localVideoRef} autoPlay playsInline muted
            className={cn("w-full h-full object-cover", isVideoOff && "hidden")}
            style={{ transform: 'scaleX(-1)' }} />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
              <User className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Timer */}
        {status === 'connected' && (
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-white shadow-lg">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <Clock className="w-4 h-4 text-zinc-400" />
            <span className="font-mono font-medium tracking-wider">{formatTime(callDuration)}</span>
          </div>
        )}

        {/* Patient file upload button */}
        {isPatient && (
          <div className="absolute bottom-28 right-6 z-10">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700/80 backdrop-blur text-white px-4 py-2 rounded-full border border-white/10 text-sm transition-colors"
            >
              {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadingFile ? 'جاري الرفع...' : 'رفع ملف'}
            </button>
          </div>
        )}

        {/* Controls Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-full shadow-2xl">
          <button
            onClick={() => {
              if (localStream.current) {
                const t = localStream.current.getAudioTracks()[0];
                if (t) { t.enabled = !t.enabled; setIsMuted(!t.enabled); }
              }
            }}
            className={cn(
              "rounded-full w-14 h-14 flex items-center justify-center border-0 transition-all duration-300",
              isMuted ? "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={() => {
              if (localStream.current) {
                const t = localStream.current.getVideoTracks()[0];
                if (t) { t.enabled = !t.enabled; setIsVideoOff(!t.enabled); }
              }
            }}
            className={cn(
              "rounded-full w-14 h-14 flex items-center justify-center transition-all duration-300",
              isVideoOff ? "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
          </button>

          <button
            onClick={handleEndCall}
            className="rounded-full w-24 h-14 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-all duration-300"
          >
            <PhoneOff className="w-5 h-5" />
            إنهاء
          </button>

          {/* Toggle panel button (doctor only) */}
          {!isPatient && (
            <button
              onClick={() => setShowPanel(p => !p)}
              className="rounded-full w-14 h-14 flex items-center justify-center bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-all duration-300 border border-blue-500/20"
              title="لوحة الوصفة"
            >
              <FileText className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Doctor Side Panel ── */}
      {!isPatient && (
        <div className={cn(
          "h-full bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300 overflow-hidden",
          showPanel ? "w-80 md:w-96" : "w-0"
        )}>
          {showPanel && (
            <>
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <h3 className="text-white font-semibold text-lg">لوحة الاستشارة</h3>
                <button onClick={() => setShowPanel(false)} className="text-zinc-400 hover:text-white">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-zinc-800">
                <button
                  onClick={() => setActiveTab('prescription')}
                  className={cn("flex-1 py-3 text-sm font-medium transition-colors",
                    activeTab === 'prescription' ? "text-blue-400 border-b-2 border-blue-400" : "text-zinc-400 hover:text-white"
                  )}
                >
                  📋 الوصفة الطبية
                </button>
                <button
                  onClick={() => setActiveTab('files')}
                  className={cn("flex-1 py-3 text-sm font-medium transition-colors",
                    activeTab === 'files' ? "text-blue-400 border-b-2 border-blue-400" : "text-zinc-400 hover:text-white"
                  )}
                >
                  📁 ملفات المريض ({patientFiles.length})
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'prescription' ? (
                  <div className="space-y-4">
                    {/* Diagnosis */}
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-1">التشخيص</label>
                      <textarea
                        value={diagnosis}
                        onChange={e => setDiagnosis(e.target.value)}
                        placeholder="أدخل التشخيص..."
                        rows={3}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 text-sm resize-none focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Treatment */}
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-1">خطة العلاج والتعليمات</label>
                      <textarea
                        value={treatment}
                        onChange={e => setTreatment(e.target.value)}
                        placeholder="أدخل خطة العلاج..."
                        rows={3}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 text-sm resize-none focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Medications */}
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">الأدوية الموصوفة</label>
                      {medications.map((m, i) => (
                        <div key={i} className="flex items-center justify-between bg-zinc-800 rounded-lg px-3 py-2 mb-2">
                          <div>
                            <p className="text-white text-sm font-medium">{m.name}</p>
                            <p className="text-zinc-400 text-xs">{m.type} • {m.frequency} • {m.duration}</p>
                          </div>
                          <button onClick={() => removeMedication(i)} className="text-zinc-500 hover:text-rose-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add medication form */}
                      <div className="bg-zinc-800/50 rounded-xl p-3 space-y-2 border border-zinc-700/50">
                        <input
                          value={newMed.name}
                          onChange={e => setNewMed(p => ({ ...p, name: e.target.value }))}
                          placeholder="اسم الدواء"
                          className="w-full bg-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <select value={newMed.type} onChange={e => setNewMed(p => ({ ...p, type: e.target.value }))}
                            className="bg-zinc-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
                            {['قرص', 'كبسول', 'شراب', 'حقنة', 'مرهم', 'قطرة'].map(t => <option key={t}>{t}</option>)}
                          </select>
                          <select value={newMed.frequency} onChange={e => setNewMed(p => ({ ...p, frequency: e.target.value }))}
                            className="bg-zinc-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
                            {['مرة يومياً', 'مرتين يومياً', 'ثلاث مرات', 'كل 8 ساعات', 'عند الحاجة'].map(f => <option key={f}>{f}</option>)}
                          </select>
                          <select value={newMed.duration} onChange={e => setNewMed(p => ({ ...p, duration: e.target.value }))}
                            className="bg-zinc-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none">
                            {['3 أيام', '5 أيام', '7 أيام', '10 أيام', '14 يوم', 'شهر'].map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                        <button onClick={addMedication} disabled={!newMed.name.trim()}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg py-2 text-sm font-medium transition-colors">
                          <Plus className="w-4 h-4" /> إضافة دواء
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientFiles.length === 0 ? (
                      <div className="text-center py-12 text-zinc-500">
                        <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">لم يرفع المريض أي ملفات بعد</p>
                      </div>
                    ) : (
                      patientFiles.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl p-3 transition-colors">
                          <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{f.name}</p>
                            <p className="text-zinc-400 text-xs">انقر للعرض</p>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── End Call Modal (Doctor) ── */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-zinc-900 rounded-3xl p-8 w-full max-w-lg border border-zinc-700 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center">
                <PhoneOff className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-white text-xl font-bold">انتهت جلسة الاستشارة</h3>
                <p className="text-zinc-400 text-sm">مدة المكالمة: {formatTime(callDuration)}</p>
              </div>
            </div>

            {/* Quick prescription summary */}
            {(diagnosis || medications.length > 0) && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">بيانات الوصفة المُدخلة</span>
                </div>
                {diagnosis && <p className="text-zinc-300 text-sm mb-1">التشخيص: {diagnosis.slice(0, 60)}{diagnosis.length > 60 ? '...' : ''}</p>}
                {medications.length > 0 && <p className="text-zinc-300 text-sm">الأدوية: {medications.map(m => m.name).join(', ')}</p>}
              </div>
            )}

            <div className="space-y-3">
              {/* Prescription fields if not filled yet */}
              {!diagnosis && medications.length === 0 && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2 text-amber-400 bg-amber-500/10 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">لم تقم بكتابة الوصفة بعد. يمكنك إضافة التشخيص والأدوية الآن:</p>
                  </div>
                  <textarea
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    placeholder="التشخيص..."
                    rows={2}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 text-sm resize-none focus:border-blue-500 focus:outline-none"
                  />
                  <textarea
                    value={treatment}
                    onChange={e => setTreatment(e.target.value)}
                    placeholder="خطة العلاج والتعليمات..."
                    rows={2}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 text-sm resize-none focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <button
                onClick={handleCompleteWithPrescription}
                disabled={isSaving || (!diagnosis && medications.length === 0)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-2xl py-3.5 font-medium transition-colors"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {isSaving ? 'جاري الحفظ...' : 'إنهاء وحفظ الوصفة'}
              </button>

              <button
                onClick={handleCompleteWithoutPrescription}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl py-3.5 font-medium transition-colors"
              >
                إنهاء بدون وصفة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
