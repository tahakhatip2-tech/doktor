import { create } from 'zustand';
import { Patient } from '../types/patient.types';
import { DoctorUser } from '../types/api.types';
import {
  setPatientToken, setPatientUser, removePatientToken, removePatientUser,
  setDoctorToken, setDoctorUser, removeDoctorToken, removeDoctorUser,
  getPatientToken, getPatientUser, getDoctorToken, getDoctorUser,
} from '../utils/storage';

type UserType = 'patient' | 'doctor' | null;

interface AuthState {
  userType: UserType;
  patientUser: Patient | null;
  doctorUser: DoctorUser | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  loginAsPatient: (token: string, user: Patient) => Promise<void>;
  loginAsDoctor: (token: string, user: DoctorUser) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updatePatientUser: (user: Partial<Patient>) => void;
  updateDoctorUser: (user: Partial<DoctorUser>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userType: null,
  patientUser: null,
  doctorUser: null,
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

  // تسجيل الخروج
  logout: async () => {
    await Promise.all([
      removePatientToken(), removePatientUser(),
      removeDoctorToken(), removeDoctorUser(),
    ]);
    set({ userType: null, patientUser: null, doctorUser: null });
  },

  // استعادة الجلسة عند إعادة فتح التطبيق
  initialize: async () => {
    set({ isLoading: true });
    try {
      const [patientToken, doctorToken] = await Promise.all([
        getPatientToken(),
        getDoctorToken(),
      ]);

      if (patientToken) {
        const user = await getPatientUser();
        set({ userType: 'patient', patientUser: user });
      } else if (doctorToken) {
        const user = await getDoctorUser();
        set({ userType: 'doctor', doctorUser: user });
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
}));
