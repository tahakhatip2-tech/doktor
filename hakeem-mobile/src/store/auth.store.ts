import { create } from 'zustand';
import { Patient } from '../types/patient.types';
import { DoctorUser } from '../types/api.types';
import {
  setPatientToken, setPatientUser, removePatientToken, removePatientUser,
  setDoctorToken, setDoctorUser, removeDoctorToken, removeDoctorUser,
  getPatientToken, getPatientUser, getDoctorToken, getDoctorUser,
  setPharmacyToken, setPharmacyUser, removePharmacyToken, removePharmacyUser,
  getPharmacyToken, getPharmacyUser,
} from '../utils/storage';

type UserType = 'patient' | 'doctor' | 'pharmacy' | null;

interface AuthState {
  userType: UserType;
  patientUser: Patient | null;
  doctorUser: DoctorUser | null;
  pharmacyUser: any | null; // TODO: Define Pharmacy type later
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  loginAsPatient: (token: string, user: Patient) => Promise<void>;
  loginAsDoctor: (token: string, user: DoctorUser) => Promise<void>;
  loginAsPharmacy: (token: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updatePatientUser: (user: Partial<Patient>) => void;
  updateDoctorUser: (user: Partial<DoctorUser>) => void;
  updatePharmacyUser: (user: Partial<any>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userType: null,
  patientUser: null,
  doctorUser: null,
  pharmacyUser: null,
  isLoading: false,
  isInitialized: false,

  // تسجيل دخول المريض
  loginAsPatient: async (token, user) => {
    await Promise.all([setPatientToken(token), setPatientUser(user)]);
    set({ userType: 'patient', patientUser: user });
  },

  // تسجيل دخول الطبيب
  loginAsDoctor: async (token, user) => {
    await Promise.all([setDoctorToken(token), setDoctorUser(user)]);
    set({ userType: 'doctor', doctorUser: user });
  },

  // تسجيل دخول الصيدلية
  loginAsPharmacy: async (token, user) => {
    await Promise.all([setPharmacyToken(token), setPharmacyUser(user)]);
    set({ userType: 'pharmacy', pharmacyUser: user });
  },

  // تسجيل الخروج
  logout: async () => {
    await Promise.all([
      removePatientToken(), removePatientUser(),
      removeDoctorToken(), removeDoctorUser(),
      removePharmacyToken(), removePharmacyUser(),
    ]);
    set({ userType: null, patientUser: null, doctorUser: null, pharmacyUser: null });
  },

  // استعادة الجلسة عند إعادة فتح التطبيق
  initialize: async () => {
    set({ isLoading: true });
    try {
      const [patientToken, doctorToken, pharmacyToken] = await Promise.all([
        getPatientToken(),
        getDoctorToken(),
        getPharmacyToken(),
      ]);

      if (patientToken) {
        const user = await getPatientUser();
        set({ userType: 'patient', patientUser: user });
      } else if (doctorToken) {
        const user = await getDoctorUser();
        set({ userType: 'doctor', doctorUser: user });
      } else if (pharmacyToken) {
        const user = await getPharmacyUser();
        set({ userType: 'pharmacy', pharmacyUser: user });
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  updatePatientUser: (updates) =>
    set((state) => ({
      patientUser: state.patientUser ? { ...state.patientUser, ...updates } : null,
    })),

  updateDoctorUser: (updates) =>
    set((state) => ({
      doctorUser: state.doctorUser ? { ...state.doctorUser, ...updates } : null,
    })),

  updatePharmacyUser: (updates) =>
    set((state) => ({
      pharmacyUser: state.pharmacyUser ? { ...state.pharmacyUser, ...updates } : null,
    })),
}));
