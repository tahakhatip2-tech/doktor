/**
 * Generates a clean URL slug from any string (Arabic or English).
 * Example:
 *   "عيادة د. طه الخطيب" → "eyada-d-ta-al-khatib"
 *   "Dr. Smith Family Clinic" → "dr-smith-family-clinic"
 */
export function generateSlug(text: string): string {
    if (!text) return 'clinic';

    const arabicMap: Record<string, string> = {
        'ا': 'a', 'أ': 'a', 'إ': 'a', 'آ': 'a',
        'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
        'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z',
        'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
        'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
        'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
        'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
        'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
        'ة': 'a', 'ء': 'a', 'ئ': 'y', 'ؤ': 'w',
    };

    let result = text.split('').map(char => arabicMap[char] ?? char).join('');

    return result
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60);
}

/**
 * Builds a full shareable clinic URL (HashRouter).
 * Example: https://yoursite.com/#/clinic/5/eyada-ta-al-khatib
 */
export function buildClinicShareUrl(clinicId: number, clinicName: string): string {
    const slug = generateSlug(clinicName || 'clinic');
    const base = window.location.origin;
    return `${base}/#/clinic/${clinicId}/${slug}`;
}

/**
 * Generates a slug for an appointment: "dr-ahmad-2025-03-19"
 */
export function buildAppointmentSlug(
    doctorName: string,
    appointmentDate: string | Date
): string {
    const name = generateSlug(doctorName || 'doctor');
    const date = new Date(appointmentDate);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${name}-${y}-${m}-${d}`.substring(0, 70);
}

/**
 * Builds the internal appointment detail URL.
 * Route: /patient/appointments/:id/:slug
 */
export function buildAppointmentUrl(
    appointmentId: number,
    doctorName: string,
    appointmentDate: string | Date
): string {
    const slug = buildAppointmentSlug(doctorName, appointmentDate);
    return `/patient/appointments/${appointmentId}/${slug}`;
}
