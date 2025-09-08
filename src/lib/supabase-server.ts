import { createServerClient, CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/types/database.types';

// Server-side Supabase client for use in Server Actions and Server Components
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  // console.log('createServerSupabaseClient - allCookies:', allCookies);

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            console.log(`Setting cookie: ${name} = ${value}`);
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Helper function to get the current user from server-side
export async function getServerUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting server user:', error);
      return null;
    }
    
    // console.log('getServerUser - user:', user ? user.id : 'No user');
    // console.log('getServerUser - session:', user ? (await supabase.auth.getSession()).data.session : 'No session');
    return user;
  } catch (error) {
    console.error('Error in getServerUser:', error);
    return null;
  }
}

// Alternative function to get user from session
export async function getServerSession() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting server session:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error in getServerSession:', error);
    return null;
  }
}