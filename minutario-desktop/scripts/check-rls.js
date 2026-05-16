const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ifkhwqfxtdfbotifxfzq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const projectRef = 'ifkhwqfxtdfbotifxfzq';

async function main() {
    console.log('=== STATUS DAS POLÍTICAS RLS ===\n');

    // Check if we can read profiles
    const { data: profiles, error } = await supabase.from('profiles').select('id, role, email').limit(5);
    if (error) {
        console.log('Erro ao ler profiles:', error.message);
    } else {
        console.log(`✓ Profiles acessíveis: ${profiles.length} registros`);
        console.log('');
        console.log('Usuários encontrados:');
        profiles.forEach(p => console.log(`  ${p.email || '(sem email)'} - role: ${p.role || 'N/A'}`));
    }

    console.log('\n========================================');
    console.log('  SQL PARA EXECUTAR NO DASHBOARD');
    console.log('========================================');
    console.log('');
    console.log('Acesse o SQL Editor já aberto no navegador');
    console.log('e cole o SQL abaixo, depois clique em RUN:\n');
    console.log('----------------------------------------\n');

    const sql = `
-- ============================================================
-- POLÍTICAS RLS PARA PROFILES
-- Permite admins e chefes gerenciarem perfis de outros usuários
-- ============================================================

-- 1. Admin global: pode fazer tudo em profiles
CREATE POLICY "admins_can_manage_all_profiles" ON profiles
    FOR ALL
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- 2. Chefe de setor: pode atualizar perfis do próprio setor
CREATE POLICY "setor_admin_can_update_sector_profiles" ON profiles
    FOR UPDATE
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'setor_admin'
        AND setor_id IN (
            SELECT setor_id FROM profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'setor_admin'
        AND setor_id IN (
            SELECT setor_id FROM profiles WHERE id = auth.uid()
        )
    );
`.trim();

    console.log(sql);
    console.log('\n----------------------------------------\n');
    console.log('Após executar, teste o gerenciamento de usuários novamente.');
}

main().catch(console.error);
