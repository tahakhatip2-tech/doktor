import * as SecureStore from 'expo-secure-store';

const PATIENT_TOKEN_KEY = 'patient_token';
const PATIENT_USER_KEY = 'patient_user';
const DOCTOR_TOKEN_KEY = 'doctor_token';
const DOCTOR_USER_KEY = 'doctor_user';

// Patient Auth
export const setPatientToken = (token: string) =>
  SecureStore.setItemAsync(PATIENT_TOKEN_KEY, token);

export const getPatientToken = () =>
  SecureStore.getItemAsync(PATIENT_TOKEN_KEY);

export const removePatientToken = () =>
  SecureStore.deleteItemAsync(PATIENT_TOKEN_KEY);

export const setPatientUser = (user: object) =>
  SecureStore.setItemAsync(PATIENT_USER_KEY, JSON.stringify(user));

export const getPatientUser = async () => {
  const raw = await SecureStore.getItemAsync(PATIENT_USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const removePatientUser = () =>
  SecureStore.deleteItemAsync(PATIENT_USER_KEY);

// Doctor Auth
export const setDoctorToken = (token: string) =>
  SecureStore.setItemAsync(DOCTOR_TOKEN_KEY, token);

export const getDoctorToken = () =>
  SecureStore.getItemAsync(DOCTOR_TOKEN_KEY);

export const removeDoctorToken = () =>
  SecureStore.deleteItemAsync(DOCTOR_TOKEN_KEY);

export const setDoctorUser = (user: object) =>
  SecureStore.setItemAsync(DOCTOR_USER_KEY, JSON.stringify(user));

export const getDoctorUser = async () => {
  const raw = await SecureStore.getItemAsync(DOCTOR_USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const removeDoctorUser = () =>
  SecureStore.deleteItemAsync(DOCTOR_USER_KEY);

// Clear all
export const clearAllStorage = async () => {
  await Promise.all([
    removePatientToken(),
    removePatientUser(),
    removeDoctorToken(),
    removeDoctorUser(),
  ]);
};
