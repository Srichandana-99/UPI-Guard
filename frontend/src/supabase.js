import { createClient } from '@supabase/supabase-js';

// Retrieve from .env in a real app, but for this demo hardcoding matching backend credentials
// In Vite, use import.meta.env.VITE_SUPABASE_URL
const supabaseUrl = 'https://oykcgolygckvavdatyjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95a2Nnb2x5Z2NrdmF2ZGF0eWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMzUyMjAsImV4cCI6MjA4MTYxMTIyMH0.3T_zx623LBtDdcXq-SbAJlDDOWsLk_GNmtqQQxwKBs8';

export const supabase = createClient(supabaseUrl, supabaseKey);
