import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, CheckCircle2, X, Smartphone } from 'lucide-react';

export default function PWAInstallBanner() {
    const { isInstallable, isInstalled, install } = usePWAInstall();
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || isInstalled || !isInstallable) return null;

    return (
        <div
            className="fixed bottom-20 inset-x-4 z-50 sm:bottom-6 sm:left-auto sm:right-6 sm:w-80 animate-fade-in"
            style={{ animation: 'slideUp 0.4s ease-out' }}
        >
            <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
                {/* شريط الألوان العلوي */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />

                <div className="p-4">
                    <div className="flex items-start gap-3">
                        {/* أيقونة التطبيق */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                            <img
                                src="/hakeem-logo.png"
                                alt="Doctor Jo"
                                className="w-10 h-10 rounded-lg object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>

                        {/* النص */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900">Doctor Jo</h3>
                                <button
                                    onClick={() => setDismissed(true)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-full hover:bg-slate-100"
                                    aria-label="إغلاق"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                ثبّت التطبيق للوصول السريع وتجربة أفضل
                            </p>
                        </div>
                    </div>

                    {/* زر التثبيت */}
                    <button
                        onClick={install}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-md hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-200"
                    >
                        <Download className="h-4 w-4" />
                        تثبيت التطبيق مجاناً
                    </button>

                    {/* نقاط المميزات */}
                    <div className="mt-2.5 flex items-center justify-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            مجاني تماماً
                        </span>
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            يعمل بدون إنترنت
                        </span>
                        <span className="flex items-center gap-1">
                            <Smartphone className="h-3 w-3 text-blue-500" />
                            iOS & Android
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
