import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hoqyfqxrjubxtgbdnidn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcXlmcXhyanVieHRnYmRuaWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0MjE4NTgsImV4cCI6MjEwNjk5Nzg1OH0.c0bl4BOKa-Lu4MI4ZdFVR0LbYy8-9j9ju1mhn4uXJDw';

export const supabase = createClient(supabaseUrl, supabaseKey);
