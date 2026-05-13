(function (global) {
  var CONFIG = {
    SUPABASE_URL: "https://nvvzcwbriktuhzzzlsnv.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52dnpjd2JyaWt0dWh6enpsc252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTAwMjgsImV4cCI6MjA5MzU2NjAyOH0.xW_kBoFN3TN3QYd5ee0VfXSrA8vXLt3i4SyLw8CufmM",
    DB_NAME: "MinutarioDB",
    DB_VERSION: 2,
    SYNC_INTERVAL_MINUTES: 5,
    TEMPLATES_TABLE: "templates",
    FOLDERS_TABLE: "folders",
    LAST_SYNC_KEY: "minutario_last_sync",
    AUTH_TOKEN_KEY: "minutario_auth_token",
    DEBUG_LOGS: true,
  };
  global.MinutarioConfig = CONFIG;
})(typeof globalThis !== "undefined" ? globalThis : this);
