import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
