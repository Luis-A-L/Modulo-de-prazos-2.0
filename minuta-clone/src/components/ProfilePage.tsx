import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Save, ShieldCheck, User, KeyRound, Info, CheckCircle2, Download } from 'lucide-react';
import { updatePassword, updateProfile, exportUserData, type UserProfile } from '../lib/auth';
import { TJPRButton } from './TJPR';

interface ProfilePageProps {
  isDarkMode: boolean;
  userProfile: UserProfile;
  sessionEmail: string;
  sessionCreatedAt?: string;
  sessionLastSignIn?: string;
  onClose: () => void;
  onProfileUpdated: (profile: UserProfile) => void;
  /** When true, auto-opens the password section (e.g. after password recovery redirect) */
  showPasswordReset?: boolean;
}

interface PasswordStrength {
  score: 0 | 1 | 2 | 3;
  label: string;
  color: string;
  bgColor: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '', color: '', bgColor: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const levels: PasswordStrength[] = [
    { score: 0, label: '', color: '', bgColor: '' },
    { score: 1, label: 'Fraca', color: 'text-red-500', bgColor: 'bg-red-500' },
    { score: 2, label: 'Média', color: 'text-amber-500', bgColor: 'bg-amber-500' },
    { score: 3, label: 'Forte', color: 'text-green-500', bgColor: 'bg-green-500' },
  ];

  return levels[score] ?? levels[0];
}

export default function ProfilePage({
  isDarkMode,
  userProfile,
  sessionEmail,
  sessionCreatedAt,
  sessionLastSignIn,
  onClose,
  onProfileUpdated,
  showPasswordReset = false,
}: ProfilePageProps) {
  const dark = isDarkMode;

  // Profile form
  const [fullName, setFullName] = useState(userProfile.full_name ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const passwordStrength = getPasswordStrength(newPassword);

  // Auto-focus password section when coming from password recovery
  const passwordSectionRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showPasswordReset && passwordSectionRef.current) {
      passwordSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showPasswordReset]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');

    if (!fullName.trim()) {
      setProfileError('O nome é obrigatório.');
      return;
    }

    setProfileSaving(true);
    const { error } = await updateProfile(userProfile.id, { full_name: fullName.trim() });
    setProfileSaving(false);

    if (error) {
      setProfileError('Erro ao atualizar perfil. Tente novamente.');
      return;
    }

    setProfileMsg('Perfil atualizado com sucesso!');
    onProfileUpdated({ ...userProfile, full_name: fullName.trim() });
    setTimeout(() => setProfileMsg(''), 4000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (newPassword.length < 8) {
      setPasswordError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (passwordStrength.score < 2) {
      setPasswordError('A senha é muito fraca. Use letras maiúsculas, minúsculas, números e caracteres especiais.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    setPasswordSaving(true);
    const { error } = await updatePassword(newPassword);
    setPasswordSaving(false);

    if (error) {
      if (error.message.includes('same_password')) {
        setPasswordError('A nova senha não pode ser igual à anterior.');
      } else {
        setPasswordError('Erro ao atualizar senha. Tente novamente.');
      }
      return;
    }

    setPasswordMsg('Senha atualizada com sucesso!');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setTimeout(() => setPasswordMsg(''), 4000);
  };

  const cardClass = dark
    ? 'bg-[#101b2b] border border-[rgba(144,169,201,0.18)]'
    : 'bg-white border border-[rgba(27,38,59,0.1)]';

  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${dark ? 'text-[#90a9c9]' : 'text-tjpr-navy-800'}`;

  const inputClass = `
    w-full px-4 py-2.5 border text-sm font-medium
    focus:outline-none focus:ring-2 focus:ring-tjpr-gold focus:ring-offset-1
    transition-colors duration-150
    ${dark
      ? 'bg-[#0d1b2a] border-[rgba(144,169,201,0.3)] text-white placeholder-gray-500 focus:border-tjpr-gold'
      : 'bg-white border-[rgba(27,38,59,0.2)] text-tjpr-navy-900 placeholder-gray-400 focus:border-tjpr-navy-700'}
  `;

  const readOnlyInputClass = `
    w-full px-4 py-2.5 border text-sm font-medium cursor-not-allowed
    ${dark
      ? 'bg-[#0a1520] border-[rgba(144,169,201,0.15)] text-gray-400'
      : 'bg-gray-50 border-[rgba(27,38,59,0.1)] text-gray-500'}
  `;

  const sectionTitleClass = `text-base font-bold ${dark ? 'text-white' : 'text-tjpr-navy-900'}`;

  const PasswordToggle = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 transition-colors ${dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
      aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
    >
      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'app-shell-dark text-white' : 'app-shell-light text-tjpr-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 border-b px-6 py-4 flex items-center justify-between gap-4
        ${dark ? 'bg-[#0d1b2a] border-[rgba(144,169,201,0.18)]' : 'bg-white border-[rgba(27,38,59,0.1)]'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center border-2 ${dark ? 'border-tjpr-gold text-tjpr-gold' : 'border-tjpr-navy-800 text-tjpr-navy-800'}`}>
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`text-lg font-bold ${dark ? 'text-white' : 'text-tjpr-navy-900'}`}>
              Meu Perfil
            </h1>
            <p className={`text-xs ${dark ? 'text-gray-400' : 'text-tjpr-gray-700'}`}>
              Gerencie suas informações pessoais e segurança
            </p>
          </div>
        </div>
        <TJPRButton variant="ghost" onClick={onClose} icon="arrow_back" size="sm">
          Voltar ao app
        </TJPRButton>
      </div>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">

        {/* Password recovery banner */}
        {showPasswordReset && (
          <div className={`flex items-center gap-3 px-4 py-3 border ${dark ? 'border-tjpr-gold/30 bg-tjpr-gold/10 text-tjpr-gold' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            <KeyRound className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              Você pode redefinir sua senha abaixo. Preencha os campos e clique em "Atualizar senha".
            </p>
          </div>
        )}

        {/* ── Seção 1: Dados Pessoais ──────────────────────────────── */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center gap-2 mb-5">
            <User className={`w-4 h-4 ${dark ? 'text-tjpr-gold' : 'text-tjpr-navy-800'}`} />
            <h2 className={sectionTitleClass}>Dados pessoais</h2>
          </div>

          {/* Feedback messages */}
          {profileMsg && (
            <div className={`mb-4 px-4 py-3 text-sm border flex items-center gap-2 ${dark ? 'bg-green-900/20 border-green-800/50 text-green-300' : 'bg-green-50 border-green-200 text-green-700'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {profileMsg}
            </div>
          )}
          {profileError && (
            <div className={`mb-4 px-4 py-3 text-sm border ${dark ? 'bg-red-900/20 border-red-800/50 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className={labelClass}>Nome completo</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                E-mail institucional
                <span className={`ml-2 normal-case text-[10px] font-normal tracking-normal ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                  (somente leitura)
                </span>
              </label>
              <input
                type="email"
                value={sessionEmail}
                readOnly
                className={readOnlyInputClass}
              />
              <p className={`mt-1 flex items-center gap-1 text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Info className="w-3 h-3" />
                O e-mail institucional não pode ser alterado.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileSaving || fullName.trim() === (userProfile.full_name ?? '')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-tjpr-gold focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed
                  ${dark ? 'bg-[#2a4a6e] hover:bg-[#335580] text-white' : 'bg-tjpr-navy-800 hover:bg-[#142033] text-white'}`}
              >
                <Save className="w-4 h-4" />
                {profileSaving ? 'Salvando…' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Seção 2: Alterar Senha ──────────────────────────────── */}
        <div ref={passwordSectionRef} className={`${cardClass} p-6`}>
          <div className="flex items-center gap-2 mb-5">
            <KeyRound className={`w-4 h-4 ${dark ? 'text-tjpr-gold' : 'text-tjpr-navy-800'}`} />
            <h2 className={sectionTitleClass}>Alterar senha</h2>
          </div>

          {/* Feedback messages */}
          {passwordMsg && (
            <div className={`mb-4 px-4 py-3 text-sm border flex items-center gap-2 ${dark ? 'bg-green-900/20 border-green-800/50 text-green-300' : 'bg-green-50 border-green-200 text-green-700'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {passwordMsg}
            </div>
          )}
          {passwordError && (
            <div className={`mb-4 px-4 py-3 text-sm border ${dark ? 'bg-red-900/20 border-red-800/50 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className={labelClass}>Nova senha</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className={`${inputClass} pr-10`}
                />
                <PasswordToggle visible={showNewPassword} onToggle={() => setShowNewPassword(v => !v)} />
              </div>

              {/* Indicador de força */}
              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map(level => (
                      <div
                        key={level}
                        className={`h-1 flex-1 transition-colors duration-200 ${
                          passwordStrength.score >= level
                            ? passwordStrength.bgColor
                            : dark ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Confirmar nova senha</label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`${inputClass} pr-10`}
                />
                <PasswordToggle visible={showConfirmNewPassword} onToggle={() => setShowConfirmNewPassword(v => !v)} />
              </div>
              {confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="mt-1 text-xs text-red-500">As senhas não coincidem.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passwordSaving || !newPassword || !confirmNewPassword}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-tjpr-gold focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed
                  ${dark ? 'bg-[#2a4a6e] hover:bg-[#335580] text-white' : 'bg-tjpr-navy-800 hover:bg-[#142033] text-white'}`}
              >
                <ShieldCheck className="w-4 h-4" />
                {passwordSaving ? 'Atualizando…' : 'Atualizar senha'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Seção 3: Informações da Conta ──────────────────────── */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center gap-2 mb-5">
            <Info className={`w-4 h-4 ${dark ? 'text-tjpr-gold' : 'text-tjpr-navy-800'}`} />
            <h2 className={sectionTitleClass}>Informações da conta</h2>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Perfil', value: userProfile.role === 'admin' ? '🛡️ Administrador' : '👤 Usuário' },
              { label: 'Conta criada em', value: formatDate(sessionCreatedAt) },
              { label: 'Último acesso', value: formatDate(sessionLastSignIn) },
            ].map(item => (
              <div
                key={item.label}
                className={`flex items-center justify-between py-2.5 px-3 border ${dark ? 'border-[rgba(144,169,201,0.1)] bg-[rgba(144,169,201,0.03)]' : 'border-[rgba(27,38,59,0.06)] bg-[rgba(27,38,59,0.01)]'}`}
              >
                <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-[#90a9c9]' : 'text-tjpr-navy-800'}`}>
                  {item.label}
                </span>
                <span className={`text-sm font-medium ${dark ? 'text-white' : 'text-tjpr-navy-900'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Seção 4: Privacidade e Dados (LGPD) ──────────────── */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className={`w-4 h-4 ${dark ? 'text-tjpr-gold' : 'text-tjpr-navy-800'}`} />
            <h2 className={sectionTitleClass}>Privacidade e dados (LGPD)</h2>
          </div>

          <div className={`mb-4 p-3 border text-xs leading-relaxed ${dark ? 'border-[rgba(144,169,201,0.15)] bg-[rgba(144,169,201,0.03)] text-gray-300' : 'border-[rgba(27,38,59,0.08)] bg-[rgba(27,38,59,0.01)] text-gray-600'}`}>
            <p className="mb-2">
              Conforme a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>, você tem direito a:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Acesso (Art. 18, II):</strong> visualizar todos os dados pessoais armazenados.</li>
              <li><strong>Correção (Art. 18, III):</strong> atualizar dados incorretos ou incompletos (seção acima).</li>
              <li><strong>Portabilidade (Art. 18, V):</strong> exportar seus dados em formato aberto.</li>
              <li><strong>Eliminação (Art. 18, VI):</strong> solicitar exclusão dos dados — contate a Assessoria P-SEP-AR.</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                const { data, error } = await exportUserData(userProfile.id);
                if (error || !data) {
                  alert('Erro ao exportar dados. Tente novamente.');
                  return;
                }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `meus-dados-tjpr-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-tjpr-gold focus:ring-offset-2
                ${dark ? 'border-[rgba(144,169,201,0.3)] text-[#90a9c9] hover:bg-[rgba(144,169,201,0.08)]' : 'border-[rgba(27,38,59,0.2)] text-tjpr-navy-800 hover:bg-[rgba(27,38,59,0.03)]'}`}
            >
              <Download className="w-4 h-4" />
              Exportar meus dados
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
