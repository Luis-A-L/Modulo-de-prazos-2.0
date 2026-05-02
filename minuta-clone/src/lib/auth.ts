import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  /** Role vem do app_metadata no JWT — definido pelo admin no Supabase Dashboard. */
  role: 'user' | 'admin';
}

/**
 * Lê o perfil do usuário: dados básicos da tabela profiles
 * + role do app_metadata do JWT (evita recursão RLS).
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const [profileResult, sessionResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single(),
    supabase.auth.getSession(),
  ]);

  if (profileResult.error || !profileResult.data) return null;

  const appMetadata = sessionResult.data.session?.user?.app_metadata ?? {};
  const role: 'user' | 'admin' =
    appMetadata['role'] === 'admin' ? 'admin' : 'user';

  return {
    ...(profileResult.data as { id: string; email: string; full_name?: string }),
    role,
  };
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, fullName?: string) {
  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/minuta/`,
      data: { full_name: fullName?.trim() || '' },
    },
  });

  // After signup, update profile with full_name if provided
  if (!result.error && result.data.user && fullName?.trim()) {
    await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', result.data.user.id);
  }

  return result;
}

/**
 * Exporta todos os dados do usuário (LGPD Art. 18 — portabilidade).
 * Retorna os dados do perfil do usuário.
 */
export async function exportUserData(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Envia email de redefinição de senha via Supabase Auth.
 * O link no email redireciona para a URL configurada no dashboard.
 */
export async function resetPassword(email: string) {
  const redirectTo = `${window.location.origin}/minuta/`;
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

/**
 * Atualiza a senha do usuário autenticado.
 * Requer sessão ativa (JWT válido).
 */
export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}

/**
 * Atualiza o perfil do usuário na tabela `profiles`.
 * RLS garante que só altera o próprio perfil (policy: users_update_own_profile).
 */
export async function updateProfile(
  userId: string,
  data: { full_name?: string }
) {
  return supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);
}
