import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Plans from "./pages/Plans";
import QueueDisplay from "./pages/QueueDisplay";
import UnifiedAuth from "./pages/UnifiedAuth";
import { ScrollToTop } from "./components/ScrollToTop";
import PWAInstallBanner from "./components/PWAInstallBanner";

// Patient Portal Pages
import PatientLayout from "./pages/patient/PatientLayout";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientClinics from "./pages/patient/PatientClinics";
import PatientClinicDetail from "./pages/patient/PatientClinicDetail";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientNotifications from "./pages/patient/PatientNotifications";
import PatientMedicalRecords from "./pages/patient/PatientMedicalRecords";
import PatientChat from "./pages/patient/PatientChat";
import PatientMessages from "./pages/patient/PatientMessages";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientOffers from "./pages/patient/PatientOffers";
import InternalChat from "./pages/InternalChat";
import PublicClinicPage from "./pages/PublicClinicPage";
import AppointmentDetail from "./pages/patient/AppointmentDetail";

import { ClinicProvider } from "./context/ClinicContext";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <ClinicProvider>
                <Toaster />
                <Sonner />
                <HashRouter>
                    <ScrollToTop />
                                        <PWAInstallBanner />
                    <Routes>
                        <Route path="/" element={<Index />} />

                        {/* â”€â”€â”€ Unified Authentication System â”€â”€â”€ */}
                        <Route path="/auth" element={<Navigate to="/unified-auth" replace />} />
                        <Route path="/unified-auth" element={<UnifiedAuth />} />

                        {/* Doctor/Admin Routes */}
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/plans" element={<Plans />} />
                        <Route path="/queue" element={<QueueDisplay />} />
                        <Route path="/internal-chat" element={<InternalChat />} />

                        {/* ─── Public Shareable Clinic Page (No Auth) ─── */}
                        <Route path="/clinic/:id" element={<PublicClinicPage />} />
                        <Route path="/clinic/:id/:slug" element={<PublicClinicPage />} />

                        {/* â”€â”€â”€ Patient Portal Routes â”€â”€â”€ */}
                        {/* Redirect legacy patient auth routes to UnifiedAuth */}
                        <Route path="/patient/login" element={<Navigate to="/unified-auth" replace />} />
                        <Route path="/patient/register" element={<Navigate to="/unified-auth" replace />} />

                        <Route path="/patient" element={<PatientLayout />}>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<PatientDashboard />} />
                            <Route path="clinics" element={<PatientClinics />} />
                            <Route path="clinics/:id" element={<PatientClinicDetail />} />
                            <Route path="appointments" element={<PatientAppointments />} />
                            <Route path="appointments/:id" element={<AppointmentDetail />} />
                            <Route path="appointments/:id/:slug" element={<AppointmentDetail />} />
                            <Route path="notifications" element={<PatientNotifications />} />
                            <Route path="medical-records" element={<PatientMedicalRecords />} />
                            <Route path="messages" element={<PatientMessages />} />
                            <Route path="profile" element={<PatientProfile />} />
                            <Route path="offers" element={<PatientOffers />} />
                            <Route path="chat/:clinicId" element={<PatientChat />} />
                        </Route>

                        {/* Catch-all */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </HashRouter>
            </ClinicProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
