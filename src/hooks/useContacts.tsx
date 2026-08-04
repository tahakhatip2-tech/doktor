import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataApi, apiFetch } from "@/lib/api";
import { exportToExcel } from "../lib/exportUtils";
import { toastWithSound } from '@/lib/toast-with-sound';

export interface Contact {
  id: string;
  user_id: string;
  name: string | null;
  phone: string;
  source: string | null;
  platform: string;
  extracted_from: string | null;
  post_id: string | null;
  created_at: string;
}

export const useContacts = () => {
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      return await dataApi.getContacts();
    },
  });

  const addContact = useMutation({
    mutationFn: async (contact: any) => {
      return await apiFetch('/contacts', { method: 'POST', body: JSON.stringify(contact) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toastWithSound.success("تمطھ إضاظپة جهة الاطھصال");
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      return await apiFetch(`/contacts/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toastWithSound.success("تم حذظپ جهة الاطھصال");
    },
  });

  const exportContacts = () => {
    if (contacts.length === 0) {
      toastWithSound.error("لا توجد جهات اتصال للتصدير");
      return;
    }

    const dataToExport = contacts.map((c: any) => ({
      "الاسم": c.name || "",
      "الهاتف": c.phone,
      "المصدر": c.source || "",
      "المنصة": c.platform,
      "مستخرج من": c.extracted_from || "",
    }));

    exportToExcel(dataToExport, 'المرضى');
    toastWithSound.success("تم تصدير جهات الاتصال بنجاح");
  };

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiFetch(`/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toastWithSound.success("تم طھحدظٹث الحالة بنجاح");
    },
  });

  const syncContacts = useMutation({
    mutationFn: async () => {
      return await dataApi.syncContacts();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toastWithSound.success(`تمطھ مزامنة ${data.synced} مرظٹض جدظٹد بنجاح`);
    },
  });

  return {
    contacts,
    isLoading,
    addContact,
    deleteContact,
    updateStatus,
    exportContacts,
    syncContacts,
  };
};
