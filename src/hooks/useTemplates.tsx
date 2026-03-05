import { useState, useEffect } from 'react';
import { toastWithSound } from '@/lib/toast-with-sound';
import { whatsappApi } from '@/lib/api';

export interface Template {
    id: number;
    trigger: string;
    response: string;
    is_active: boolean;
    priority: number;
}

export const useTemplates = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const data = await whatsappApi.getTemplates();
            // Ensure data is an array before setting state
            setTemplates(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching templates:', error);
            // setTemplates([]); // Safe fallback
            toastWithSound.error('ظپشل في تحميل القظˆالب');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const addTemplate = async (trigger: string, response: string) => {
        try {
            await whatsappApi.createTemplate({ trigger, response, priority: 0 });
            toastWithSound.success('تم حظپظ القالب بنجاح');
            fetchTemplates();
        } catch (error) {
            toastWithSound.error('ظپشل في إضاظپة القالب');
        }
    };

    const deleteTemplate = async (id: number) => {
        try {
            await whatsappApi.deleteTemplate(id);
            toastWithSound.success('تم حذظپ القالب');
            fetchTemplates();
        } catch (error) {
            toastWithSound.error('ظپشل في حذظپ القالب');
        }
    };

    const updateTemplate = async (id: number, trigger: string, response: string) => {
        try {
            await whatsappApi.updateTemplate(id, { trigger, response, is_active: 1, priority: 0 });
            toastWithSound.success('تم طھحدظٹث القالب');
            fetchTemplates();
        } catch (error) {
            toastWithSound.error('ظپشل في طھحدظٹث القالب');
        }
    };

    return { templates, addTemplate, deleteTemplate, updateTemplate, isLoading, refresh: fetchTemplates };
};
