/**
 * Apply RLS policies for profiles table updates by admins.
 * Run this with SUPABASE_SERVICE_ROLE_KEY set.
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ifkhwqfxtdfbotifxfzq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
    console.error('Defina SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
    console.log('Verificando e aplicando políticas RLS na tabela profiles...\n');

    // First, try to update a random user to see current error
    const { data: someUser, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

    if (fetchError) {
        console.error('Erro ao acessar profiles:', fetchError.message);
        if (fetchError.message.includes('permission denied')) {
            console.log('Confirmado: falta política RLS para admins escreverem em profiles.');
        }
    } else {
        console.log(`Acesso de leitura OK. Primeiro user: ${someUser?.[0]?.id}`);
    }

    // Since we can't run SQL directly, we'll output the SQL for the user to run
    console.log('\n==================================================');
    console.log('  SQL PARA EXECUTAR NO SUPABASE DASHBOARD');
    console.log('==================================================');
    console.log('');
    console.log('Acesse: https://supabase.com/dashboard/project/ifkhwqfxtdfbotifxfzq/sql/new');
    console.log('');
    console.log('Copie e cole o SQL abaixo e clique em "RUN":');
    console.log('');
    console.log('-- ============================================================');
    console.log('-- POLÍTICAS RLS PARA PROFILES');
    console.log('-- Permite admins e chefes atualizarem perfis de outros usuários');
    console.log('-- ============================================================');
    console.log('');
    console.log('-- 1. Política para admins: podem fazer tudo em profiles');
    console.log('CREATE POLICY "admins_can_manage_all_profiles" ON profiles');
    console.log('    FOR ALL');
    console.log('    USING (');
    console.log('        auth.uid() IN (');
    console.log('            SELECT id FROM profiles WHERE role = \'admin\'');
    console.log('        )');
    console.log('    )');
    console.log('    WITH CHECK (');
    console.log('        auth.uid() IN (');
    console.log('            SELECT id FROM profiles WHERE role = \'admin\'');
    console.log('        )');
    console.log('    );');
    console.log('');
    console.log('-- 2. Política para chefes: podem atualizar perfis do próprio setor');
    console.log('CREATE POLICY "setor_admin_can_manage_sector_profiles" ON profiles');
    console.log('    FOR UPDATE');
    console.log('    USING (');
    console.log('        auth.uid() IN (');
    console.log('            SELECT id FROM profiles WHERE role = \'setor_admin\'');
    console.log('        )');
    console.log('        AND setor_id IN (');
    console.log('            SELECT setor_id FROM profiles WHERE id = auth.uid()');
    console.log('        )');
    console.log('    )');
    console.log('    WITH CHECK (');
    console.log('        auth.uid() IN (');
    console.log('            SELECT id FROM profiles WHERE role = \'setor_admin\'');
    console.log('        )');
    console.log('        AND setor_id IN (');
    console.log('            SELECT setor_id FROM profiles WHERE id = auth.uid()');
    console.log('        )');
    console.log('    );');
    console.log('');
    console.log('-- 3. Política para usuários: podem atualizar PRÓPRIO perfil');
    console.log('--    (já deve existir, mas incluímos para garantir)');
    console.log('CREATE POLICY "users_can_update_own_profile" ON profiles');
    console.log('    FOR UPDATE');
    console.log('    USING (auth.uid() = id)');
    console.log('    WITH CHECK (auth.uid() = id);');
    console.log('');
    console.log('==================================================');
}

main().catch(console.error);
