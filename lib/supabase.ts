import { createClient } from '@supabase/supabase-js';

// Mengambil kunci rahasia dari file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Membuat "mesin" penghubung (client) ke database
export const supabase = createClient(supabaseUrl, supabaseKey);