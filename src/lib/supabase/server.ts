import { cookies } from 'next/headers';
import { Database } from '@/lib/types/database.types';
import { createServerClient } from '@supabase/ssr';

/**
 * Generic server-side client (use in Server Components, Route Handlers, etc.)
 */
export async function createServerSupabaseClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          try {
            (await cookieStore).set({ name, value, ...options });
          } catch {
            // ignore if called from a Server Component
          }
        },
        async remove(name: string, options: any) {
          try {
            (await cookieStore).set({ name, value: '', ...options });
          } catch {
            // ignore if called from a Server Component
          }
        },
      },
    }
  );
}
