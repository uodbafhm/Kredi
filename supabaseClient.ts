
import { createClient } from '@supabase/supabase-js';

// المعلومات ديال قاعدة البيانات اللي عطيتي
const SUPABASE_URL = 'https://jgibntvdbgsebzvnwuaw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaWJudHZkYmdzZWJ6dm53dWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTUxNzQsImV4cCI6MjA4NjQzMTE3NH0.kwwtcOx6oJv-j6a0YgWwYq8yCtlgQRnsbkFx60H17Tk';

// إنشاء الاتصال
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
