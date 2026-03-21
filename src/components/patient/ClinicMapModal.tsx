import { useEffect, useRef } from 'react';
import { X, Navigation, ExternalLink } from 'lucide-react';

interface ClinicMapModalProps {
    clinic: {
        id?: number;
        clinic_name?: string;
        name?: string;
        clinic_address?: string;
        location_url?: string;
        lat?: number | null;
        lng?: number | null;
    };
    onClose: () => void;
}

// ── Haversine distance helper ──────────────────────────────
export function haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Build Google Maps URL ──────────────────────────────────
function buildMapsUrl(clinic: ClinicMapModalProps['clinic']): string | null {
    if (clinic.location_url) return clinic.location_url;
    if (clinic.lat != null && clinic.lng != null)
        return `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`;
    if (clinic.clinic_address)
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.clinic_address)}`;
    return null;
}

export default function ClinicMapModal({ clinic, onClose }: ClinicMapModalProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    const clinicName = clinic.clinic_name || clinic.name || 'العيادة';
    const hasCoords = clinic.lat != null && clinic.lng != null;
    const mapsUrl = buildMapsUrl(clinic);

    useEffect(() => {
        if (!hasCoords || !mapRef.current || mapInstanceRef.current) return;

        import('leaflet').then((L) => {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            const map = L.map(mapRef.current!).setView([clinic.lat!, clinic.lng!], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            L.marker([clinic.lat!, clinic.lng!])
                .addTo(map)
                .bindPopup(
                    `<div style="font-family:Cairo,sans-serif;direction:rtl;text-align:right;min-width:150px">
                        <strong style="font-size:13px;color:#1e3a5f">${clinicName}</strong>
                        ${clinic.clinic_address ? `<br/><span style="color:#666;font-size:11px">📍 ${clinic.clinic_address}</span>` : ''}
                    </div>`,
                    { maxWidth: 220 }
                )
                .openPopup();

            mapInstanceRef.current = map;
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [hasCoords, clinic.lat, clinic.lng]);

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div>
                        <p className="font-black text-base">{clinicName}</p>
                        {clinic.clinic_address && (
                            <p className="text-blue-200 text-xs mt-0.5 truncate max-w-[240px]">📍 {clinic.clinic_address}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Map or fallback */}
                <div className="relative bg-slate-100" style={{ height: '280px' }}>
                    {hasCoords ? (
                        <div ref={mapRef} className="w-full h-full z-10" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                            <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                                <Navigation className="h-8 w-8 text-blue-400" />
                            </div>
                            <div className="text-center px-6">
                                <p className="font-bold text-slate-700 mb-1">معاينة الخريطة غير متاحة</p>
                                <p className="text-sm text-slate-500">
                                    {clinic.clinic_address ? `العنوان: ${clinic.clinic_address}` : 'لا يوجد عنوان محدد'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-4 bg-white border-t">
                    {mapsUrl ? (
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 text-sm transition-all shadow-sm"
                        >
                            <Navigation className="h-4 w-4" />
                            التوجيه عبر خرائط Google
                            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                        </a>
                    ) : null}
                    <button
                        onClick={onClose}
                        className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
}
