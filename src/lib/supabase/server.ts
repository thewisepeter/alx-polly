import { cookies } from 'next/headers';
import { Database } from '@/lib/types/database.types';
import { createServerClient } from '@supabase/ssr';

/**
 * Generic server-side client (use in Server Components, Route Handlers, etc.)
 */
export async function createServerSupabaseClient(cookieStore: ReturnType<typeof cookies>) {
  console.log('createServerSupabaseClient - cookieStore:', cookieStore);
  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieValue = (await cookieStore).get(name)?.value;
          console.log(`createServerSupabaseClient - get cookie ${name}:`, cookieValue);
          return cookieValue;
        },
        async set(name: string, value: string, options: any) {
          try {
            console.log(`createServerSupabaseClient - set cookie ${name}:`, value, options);
            (await cookieStore).set({ name, value, ...options });
          } catch (e) {
            console.error(`createServerSupabaseClient - error setting cookie ${name}:`, e);
            // ignore if called from a Server Component
          }
        },
        async remove(name: string, options: any) {
          try {
            console.log(`createServerSupabaseClient - remove cookie ${name}:`, options);
            (await cookieStore).set({ name, value: '', ...options });
          } catch (e) {
            console.error(`createServerSupabaseClient - error removing cookie ${name}:`, e);
            // ignore if called from a Server Component
          }
        },
      },
    }
  );
  console.log('createServerSupabaseClient - returned client:', client);
  return client;
}
