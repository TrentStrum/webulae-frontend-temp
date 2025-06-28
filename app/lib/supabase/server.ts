'use server';

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/app/types/database.types';

export const createServerSupabaseClient = async (): Promise<SupabaseClient<Database>> => {
	const cookieStore = cookies();
	const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
	return supabase;
};

export const createServiceRoleClient = (): SupabaseClient<Database> => {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
	if (!supabaseKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');

	return createClient<Database>(supabaseUrl, supabaseKey);
};
