import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import type { UserRole } from '../../types';

const ROLES: Extract<UserRole, 'buyer' | 'agent' | 'supplier'>[] = ['buyer', 'agent', 'supplier'];

export default function Signup() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('buyer');
  const [form, setForm] = useState({ full_name: '', company_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          company_name: form.company_name,
          role,
        },
      },
    });

    setLoading(false);
    if (signupError) { setError(signupError.message); return; }

    // With email confirmation required, signUp succeeds but returns no
    // session until the user clicks the link in their inbox.
    if (!data.session) { setConfirmationSent(true); return; }
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#e2006a] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">SB</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('signup.join')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('signup.subtitle')}</p>
        </div>

        {confirmationSent ? (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-2xl">📧</div>
            <h2 className="font-semibold text-gray-900">{t('signup.checkEmail.title')}</h2>
            <p className="text-sm text-gray-500">
              {t('signup.checkEmail.body', { email: form.email })}
            </p>
            <Link to="/login" className="inline-block mt-2 text-sm text-[#e2006a] font-medium hover:underline">
              {t('signup.checkEmail.backToSignIn')}
            </Link>
          </div>
        ) : step === 1 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 mb-2">{t('signup.iAmA')}</p>
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  role === r ? 'border-[#e2006a] bg-pink-50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="font-semibold text-sm text-gray-900">{t(`signup.role.${r}.label`)}</div>
                <div className="text-xs text-gray-500 mt-0.5">{t(`signup.role.${r}.desc`)}</div>
              </button>
            ))}
            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#e2006a] text-white font-semibold py-2.5 rounded-full hover:bg-[#b8005a] transition-colors mt-2"
            >
              {t('signup.continue')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('signup.fullName')}</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => update('full_name', e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e2006a]/30 focus:border-[#e2006a]"
                  placeholder={t('signup.fullNamePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('signup.companyName')}</label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={e => update('company_name', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e2006a]/30 focus:border-[#e2006a]"
                  placeholder={t('signup.companyPlaceholder')}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('signup.email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e2006a]/30 focus:border-[#e2006a]"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('signup.password')}</label>
              <input
                type="password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e2006a]/30 focus:border-[#e2006a]"
                placeholder={t('signup.passwordPlaceholder')}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-full hover:bg-gray-50 transition-colors text-sm">
                {t('signup.back')}
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-[#e2006a] text-white font-semibold py-2.5 rounded-full hover:bg-[#b8005a] transition-colors disabled:opacity-60">
                {loading ? t('signup.creating') : t('signup.createAccount')}
              </button>
            </div>
          </form>
        )}

        <p className={`text-center text-sm text-gray-500 mt-4 ${confirmationSent ? 'hidden' : ''}`}>
          {t('signup.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-[#e2006a] font-medium hover:underline">{t('signup.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
