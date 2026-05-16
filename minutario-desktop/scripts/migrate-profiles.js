const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ifkhwqfxtdfbotifxfzq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
    console.error('Defina SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
    console.log('Adding new columns to profiles table...');

    // Try to use the management API directly
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
    });

    const rootData = await response.json();
    console.log('API Root:', JSON.stringify(rootData).substring(0, 500));

    // Try using the pg_dump or sql endpoint
    // Supabase free tier: use direct table manipulation
    // We can just try inserting a value with the new column — Postgres will error if column doesn't exist
    // Or we can try updating profiles to set the new fields — will error if columns don't exist
    console.log('\nChecking if columns already exist...');
    const { data, error } = await supabase
        .from('profiles')
        .update({ acesso_minutario: false, acesso_minuta_preparo: false })
        .eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent user

    if (error) {
        if (error.message?.includes('column') && error.message?.includes('does not exist')) {
            console.log('Columns do not exist yet. Need to add them via Supabase Dashboard SQL editor.');
            console.log('\nPlease run this SQL in the Supabase Dashboard SQL Editor:');
            console.log('  https://supabase.com/dashboard/project/ifkhwqfxtdfbotifxfzq/sql/new');
            console.log('\nSQL:');
            console.log('  ALTER TABLE profiles');
            console.log('  ADD COLUMN IF NOT EXISTS acesso_minutario BOOLEAN DEFAULT false;');
            console.log('');
            console.log('  ALTER TABLE profiles');
            console.log('  ADD COLUMN IF NOT EXISTS acesso_minuta_preparo BOOLEAN DEFAULT false;');
        } else {
            console.log('Other error:', error.message);
        }
    } else {
        console.log('Columns already exist! Update succeeded (no actual rows affected).');
    }
}

main().catch(console.error);
