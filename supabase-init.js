// supabase-init.js
// Inicializa o cliente Supabase e expõe globalmente (substitui firebase-init.js)

const SUPABASE_URL = 'https://ifkhwqfxtdfbotifxfzq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlma2h3cWZ4dGRmYm90aWZ4ZnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTc0ODksImV4cCI6MjA5MzU3MzQ4OX0.iN5PKFougk2xfpI_etHzJSJxn4egN6kd-_8dV-sSCwM';

window._supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
