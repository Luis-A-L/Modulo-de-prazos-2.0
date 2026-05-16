const CONFIG = {
    SUPABASE_URL: 'https://ifkhwqfxtdfbotifxfzq.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlma2h3cWZ4dGRmYm90aWZ4ZnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTc0ODksImV4cCI6MjA5MzU3MzQ4OX0.iN5PKFougk2xfpI_etHzJSJxn4egN6kd-_8dV-sSCwM',
    DB_NAME: 'MinutarioDB',
    DB_VERSION: 2,
    SYNC_INTERVAL_MINUTES: 5,
    TEMPLATES_TABLE: 'minutario_templates',
    FOLDERS_TABLE: 'minutario_folders',
    LAST_SYNC_KEY: 'minutario_last_sync',
    AUTH_TOKEN_KEY: 'minutario_auth_token',
    DEBUG_LOGS: true,
    INSTALLER_BUCKET: 'minutario-installers',
};

module.exports = CONFIG;
