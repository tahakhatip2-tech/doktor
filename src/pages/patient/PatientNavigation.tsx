import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Navigation, ArrowRight, Clock, AlertTriangle, Car, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { BASE_URL } from '@/lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface RouteData {
    distance: number; // in meters
    duration: number; // in seconds
    coordinates: [number, number][]; // [lat, lng]
}

export default function PatientNavigation() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [clinic, setClinic] = useState<any>(null);
    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [route, setRoute] = useState<RouteData | null>(null);
    const [watchId, setWatchId] = useState<number | null>(null);

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const userMarkerRef = useRef<any>(null);
    const routeLayerRef = useRef<any>(null);

    // Fetch clinic data
    useEffect(() => {
        const fetchClinic = async () => {
            try {
                const token = localStorage.getItem('patient_token');
                const res = await axios.get(`${API_URL}/patient/clinics/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClinic(res.data?.data || res.data);
            } catch (error) {
                toast({ variant: 'destructive', title: 'خطأ', description: 'لم نتمكن من جلب بيانات العيادة' });
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchClinic();
    }, [id, navigate]);

    // Start Live Tracking
    useEffect(() => {
        if (!navigator.geolocation) {
            toast({ variant: 'destructive', title: 'متصفحك لا يدعم التتبع' });
            return;
        }

        const id = navigator.geolocation.watchPosition(
            (pos) => {
                setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            (err) => {
                console.warn('Live tracking warning:', err.message);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        setWatchId(id);
        return () => navigator.geolocation.clearWatch(id);
    }, []);

    // Fetch Route from OSRM mapping public API
    useEffect(() => {
        if (!clinic?.lat || !clinic?.lng || !userLoc) return;

        const fetchRoute = async () => {
            try {
                // OSRM coordinates are in format: lng,lat
                const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${clinic.lng},${clinic.lat}?overview=full&geometries=geojson`;
                const res = await axios.get(osrmUrl);
                const data = res.data.routes[0];
                
                // OSRM returns array of [lng, lat], map it to Leaflet [lat, lng]
                const coords = data.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
                
                setRoute({
                    distance: data.distance,
                    duration: data.duration,
                    coordinates: coords
                });
            } catch (error) {
                console.error("OSRM Route Error:", error);
            }
        };

        // Don't fetch every second, fetch only if route is null (initially)
        if (!route) {
            fetchRoute();
        }
    }, [clinic, userLoc, route]);

    // Setup Leaflet Map
    useEffect(() => {
        if (!mapRef.current || !clinic?.lat || !userLoc) return;

        // Dynamic Loading to prevent SSR errors
        import('leaflet').then((L) => {
            if (!mapInstanceRef.current) {
                // Fix default marker icon issues
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                });

                const map = L.map(mapRef.current, { zoomControl: false }).setView([userLoc.lat, userLoc.lng], 15);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap © CARTO'
                }).addTo(map);

                // Add Clinic Marker (Goal)
                const clinicIcon = L.divIcon({
                    html: `<div class="bg-red-500 rounded-full w-10 h-10 flex items-center justify-center shadow-xl border-2 border-white text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg></div>`,
                    className: '', iconSize: [40, 40], iconAnchor: [20, 40]
                });
                L.marker([clinic.lat, clinic.lng], { icon: clinicIcon }).addTo(map);

                // Add User Marker (Car)
                const userIcon = L.divIcon({
                    html: `<div class="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow-xl border-2 border-white text-white relative"><div class="absolute -inset-2 bg-blue-500 rounded-full animate-ping opacity-30"></div><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>`,
                    className: '', iconSize: [40, 40], iconAnchor: [20, 20]
                });
                userMarkerRef.current = L.marker([userLoc.lat, userLoc.lng], { icon: userIcon }).addTo(map);

                mapInstanceRef.current = map;
            } else {
                // Update User Position
                const map = mapInstanceRef.current;
                userMarkerRef.current.setLatLng([userLoc.lat, userLoc.lng]);
                map.panTo([userLoc.lat, userLoc.lng], { animate: true });
            }

            // Draw Route if available
            if (route && mapInstanceRef.current) {
                if (routeLayerRef.current) mapInstanceRef.current.removeLayer(routeLayerRef.current);
                
                routeLayerRef.current = L.polyline(route.coordinates, {
                    color: '#3b82f6', // blue-500
                    weight: 6,
                    opacity: 0.8,
                    lineCap: 'round',
                    lineJoin: 'round',
                    className: 'animate-pulse' // Adding some CSS magic
                }).addTo(mapInstanceRef.current);

                // Auto bounding box on first load
                if (!routeLayerRef.current.hasZoomed) {
                    mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });
                    routeLayerRef.current.hasZoomed = true;
                }
            }
        });
    }, [clinic, userLoc, route]);

    if (loading) return <div className="h-screen bg-slate-50 flex items-center justify-center">جاري التحميل...</div>;
    
    if (!clinic?.lat) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50" dir="rtl">
                <ShieldAlert className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold mb-2">تعذر تحديد المسار</h2>
                <p className="text-slate-500 mb-6">هذه العيادة لم تقم بتحديد إحداثيات موقعها الدقيق على الخريطة.</p>
                <Button onClick={() => navigate(-1)}>العودة للعيادات</Button>
            </div>
        );
    }

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return "أقل من دقيقة";
        const m = Math.round(seconds / 60);
        return `${m} دقيقة`;
    };

    const formatDistance = (meters: number) => {
        return meters > 1000 ? `${(meters/1000).toFixed(1)} كم` : `${Math.round(meters)} متر`;
    };

    return (
        <div className="h-screen w-full flex flex-col relative bg-slate-100 overflow-hidden" dir="rtl">
            {/* Header / Top Bar */}
            <div className="absolute top-0 inset-x-0 z-[400] bg-gradient-to-b from-black/60 to-transparent pt-6 pb-12 px-4 pointer-events-none">
                <div className="flex justify-between items-start pointer-events-auto">
                    <button 
                        onClick={() => navigate(-1)}
                        className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-white/30 transition shadow-lg"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </button>
                    {!userLoc && (
                        <div className="bg-yellow-500/90 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg animate-pulse flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            جاري جلب موقعك...
                        </div>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div ref={mapRef} className="flex-1 w-full bg-slate-200" />

            {/* Floating Navigation Dashboard */}
            <div className="absolute bottom-6 inset-x-4 z-[400] animate-in slide-in-from-bottom-12 duration-500">
                <div className="bg-white rounded-3xl shadow-2xl p-5 border border-slate-100/50 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                        <div className="bg-blue-600 p-3.5 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                            <Navigation className="w-6 h-6 fill-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-extrabold text-blue-900 text-lg sm:text-xl truncate">إلى: {clinic.clinic_name || 'العيادة'}</h3>
                            <p className="text-slate-500 text-xs sm:text-sm truncate w-full flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {clinic.clinic_address || 'الاتجاه نحو نقطة الوصول'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <p className="text-slate-400 text-xs font-bold mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/>الوقت المتبقي</p>
                            <p className="font-black text-xl sm:text-2xl text-slate-800">
                                {route ? formatDuration(route.duration) : "..."}
                            </p>
                            {route && <p className="text-[10px] text-green-600 font-bold mt-1">المسار سالك</p>}
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 relative overflow-hidden">
                             <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                            <p className="text-slate-400 text-xs font-bold mb-1 flex items-center gap-1.5"><Car className="w-3.5 h-3.5"/>المسافة</p>
                            <p className="font-black text-xl sm:text-2xl text-blue-600">
                                {route ? formatDistance(route.distance) : "..."}
                            </p>
                            {route && <p className="text-[10px] text-slate-400 font-bold mt-1">تتبع حي GPS</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
