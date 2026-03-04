// Use current origin for API calls to work seamlessly with proxying and ngrok
let baseApiUrl = import.meta.env.VITE_API_URL || '/api';
// Ensure absolute URLs (like ngrok) also get the /api suffix if missing
if (baseApiUrl.startsWith('http') && !baseApiUrl.endsWith('/api')) {
    baseApiUrl = baseApiUrl.endsWith('/') ? `${baseApiUrl}api` : `${baseApiUrl}/api`;
}
export const API_URL = baseApiUrl;
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export { BASE_URL };

export const apiFetch = async (endpoint: string, options: any = {}) => {
    const token = localStorage.getItem('token');
    const isFormData = options.body instanceof FormData;
    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
        'Bypass-Tunnel-Reminder': 'true', // Bypass localtunnel warning page
        ...options.headers,
    };

    const url = `${API_URL}${endpoint}`;
    console.log(`[API] Fetching: ${url}`);

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            console.warn('[API] Unauthorized - Clearing session');
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Only redirect to unified-auth if not already there, and importantly: 
            // DO NOT redirect if the user is currently browsing the patient portal.
            const hash = window.location.hash;
            if (!hash.startsWith('#/unified-auth') && !hash.startsWith('#/patient')) {
                window.location.hash = '#/unified-auth';
            }
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            let errorMessage = 'Something went wrong';
            try {
                const error = await response.json();
                errorMessage = error.message || error.error || errorMessage;
            } catch (e) {
                errorMessage = response.statusText || `Server Error (${response.status})`;
            }
            throw new Error(errorMessage);
        }

        // Handle empty responses or non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            // If response is not JSON, return a success object
            return { success: true, message: 'Operation completed' };
        }

        const text = await response.text();
        if (!text || text.trim() === '') {
            // Empty response, return success
            return { success: true, message: 'Operation completed' };
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            console.warn('[API] Failed to parse JSON response:', text);
            return { success: true, message: 'Operation completed', rawResponse: text };
        }
    } catch (error: any) {
        console.error('[API] Fetch error:', error.message);
        throw error;
    }
};

export const authApi = {
    login: (credentials: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (data: any) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
};

export const adminApi = {
    getUsers: () => apiFetch('/users'),
    updateUser: (id: number, data: any) => apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

export const dataApi = {
    get: (url: string) => apiFetch(url),
    post: (url: string, data: any) => apiFetch(url, { method: 'POST', body: JSON.stringify(data) }),
    patch: (url: string, data: any) => apiFetch(url, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (url: string) => apiFetch(url, { method: 'DELETE' }),
    getContacts: () => apiFetch('/contacts'),
    syncContacts: () => apiFetch('/contacts/sync', { method: 'POST' }),
    getStats: () => apiFetch('/stats'),
};

export const contactsApi = {
    getAll: () => apiFetch('/contacts'),
    getById: (id: number | string) => apiFetch(`/contacts/${id}`),
    sync: () => apiFetch('/contacts/sync', { method: 'POST' }),
    findByNationalId: (id: string) => apiFetch(`/contacts/search/national-id/${id}`),
    updateStatus: (id: number, status: string) => apiFetch(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete: (id: number) => apiFetch(`/contacts/${id}`, { method: 'DELETE' }),
};

export const groupsApi = {
    getAll: () => apiFetch('/groups'),
    create: (data: any) => apiFetch('/groups', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string | number, status: string) => apiFetch(`/groups/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete: (id: string | number) => apiFetch(`/groups/${id}`, { method: 'DELETE' }),
};

export const postsApi = {
    getAll: () => apiFetch('/posts'),
};

export const whatsappApi = {
    getStatus: () => apiFetch('/whatsapp/status'),
    connect: () => apiFetch('/whatsapp/connect', { method: 'POST' }),
    logout: () => apiFetch('/whatsapp/logout', { method: 'DELETE' }),
    disconnect: () => apiFetch('/whatsapp/logout', { method: 'DELETE' }),
    // Chats & Messages
    getChats: () => apiFetch('/whatsapp/chats'),
    deleteChat: (id: string | number) => apiFetch(`/whatsapp/chats/${id}`, { method: 'DELETE' }),
    getMessages: (id: string | number) => apiFetch(`/whatsapp/chats/${id}/messages`),
    markRead: (id: string | number) => apiFetch(`/whatsapp/chats/${id}/read`, { method: 'PATCH' }),
    send: (data: any) => apiFetch('/whatsapp/send', { method: 'POST', body: JSON.stringify(data) }),
    // Templates
    getTemplates: () => apiFetch('/whatsapp/templates'),
    createTemplate: (data: any) => apiFetch('/whatsapp/templates', { method: 'POST', body: JSON.stringify(data) }),
    updateTemplate: (id: number, data: any) => apiFetch(`/whatsapp/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTemplate: (id: number) => apiFetch(`/whatsapp/templates/${id}`, { method: 'DELETE' }),
    // Settings
    getSettings: () => apiFetch('/whatsapp/settings'),
    updateSettings: (data: any) => apiFetch('/whatsapp/settings', { method: 'POST', body: JSON.stringify(data) }),
    upload: (formData: FormData) => apiFetch('/whatsapp/upload', { method: 'POST', body: formData }),
    // Tags
    getTags: () => apiFetch('/whatsapp/tags'),
    getContactTags: (phone: string) => apiFetch(`/whatsapp/contacts/${phone}/tags`),
    addContactTag: (phone: string, tagId: number) => apiFetch(`/whatsapp/contacts/${phone}/tags`, { method: 'POST', body: JSON.stringify({ tagId }) }),
    removeContactTag: (phone: string, tagId: number) => apiFetch(`/whatsapp/contacts/${phone}/tags/${tagId}`, { method: 'DELETE' }),
};

export const appointmentsApi = {
    getAll: () => apiFetch('/appointments'),
    getStats: () => apiFetch('/appointments/stats'),
    create: (data: any) => apiFetch('/appointments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiFetch(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    /** تحديث الحالة فقط — يُشغّل إشعار Socket.io للمريض تلقائياً من الباك اند */
    updateStatus: (id: number, status: string) => apiFetch(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete: (id: number) => apiFetch(`/appointments/${id}`, { method: 'DELETE' }),
    generatePrescription: (id: number) => apiFetch(`/appointments/${id}/prescription`, { method: 'POST' }),
    sendPrescription: (id: number, data: any) => apiFetch(`/appointments/${id}/prescription/send`, { method: 'POST', body: JSON.stringify(data) }),
    confirm: (id: number) => apiFetch(`/appointments/${id}/confirm`, { method: 'POST' }),
    reject: (id: number, reason?: string) => apiFetch(`/appointments/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
    saveMedicalRecord: (id: number, data: any) => {
        const isFormData = data instanceof FormData;
        return apiFetch(`/appointments/${id}/medical-record`, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data)
        });
    }
};

export const notificationsApi = {
    getAll: () => apiFetch('/notifications'),
    getUnreadCount: () => apiFetch('/notifications/unread-count'),
    markRead: (id: number) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => apiFetch('/notifications/mark-all-read', { method: 'PUT' }),
};
