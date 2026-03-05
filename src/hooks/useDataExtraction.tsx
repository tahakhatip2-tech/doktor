import { useState } from "react";
import { toastWithSound } from '@/lib/toast-with-sound';
import { useAuth } from "./useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { dataApi, apiFetch } from "@/lib/api";

export interface ExtractionResult {
  success: boolean;
  message: string;
  data: any[];
  count: number;
}

export const useDataExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const extractFromUrl = async (url: string, platform: string = 'unknown', type: string = 'post'): Promise<ExtractionResult | null> => {
    if (!user) {
      toastWithSound.error("ظٹجب تسجيل الدخظˆل أظˆلاً");
      return null;
    }

    setIsExtracting(true);
    try {
      const response = await dataApi.scrape({ url, platform, type });

      toastWithSound.success(`تم اسطھخراج ${response.count} رقم بنجاح`);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });

      return {
        success: true,
        message: "تم الاسطھخراج ظˆالحظپظ بنجاح",
        data: response.phones,
        count: response.count
      };
    } catch (error: any) {
      toastWithSound.error(error.message || "ظپشل الاسطھخراج (تأكد من ظپعالظٹة الاشطھراظƒ)");
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  const extractFromText = async (text: string, platform: string = 'unknown'): Promise<ExtractionResult | null> => {
    if (!user) {
      toastWithSound.error("يرجى إدخال أرقام صحظٹحة");
      return null;
    }

    setIsExtracting(true);
    try {
      const phoneRegex = /(?:\+?(\d{1,3}))?[-. (]*(01[0125]|05\d|09\d)[-. )]*(\d{7,8})/g;
      const phones = [...new Set(text.match(phoneRegex) || [])];

      if (phones.length > 0) {
        // Save manually via API for text paste
        for (const phone of phones) {
          await apiFetch('/contacts', {
            method: 'POST',
            body: JSON.stringify({ phone, platform, source: 'Text Paste' })
          });
        }
        toastWithSound.success(`تم حظپظ ${phones.length} رقم بنجاح`);
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
      }

      return { success: true, message: "تم الحظپظ", data: phones, count: phones.length };
    } catch (error: any) {
      toastWithSound.error("حدث خطأ أثناء الحظپظ");
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  return { extractFromUrl, extractFromText, isExtracting };
};
