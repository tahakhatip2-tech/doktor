import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabasePublishableKey) {
  console.error(
    '[Supabase] Missing environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY'
  );
}

/**
 * Supabase client — استخدم هذا في الفرونت اند فقط.
 * للعمليات الحساسة التي تتطلب service_role استخدم الباكند (NestJS).
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: false, // نستخدم JWT خاص بنا، لا نعتمد على Supabase Auth
  },
});

/**
 * اختبار الاتصال بـ Supabase — يُستخدم للتشخيص فقط.
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('User').select('id').limit(1);
    if (error) {
      console.error('[Supabase] Connection test failed:', error.message);
      return false;
    }
    console.log('[Supabase] ✅ Connection successful');
    return true;
  } catch (err: any) {
    console.error('[Supabase] Connection error:', err.message);
    return false;
  }
}
