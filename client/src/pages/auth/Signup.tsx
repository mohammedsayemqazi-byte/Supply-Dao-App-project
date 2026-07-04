import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { UserRole } from '../../types';

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'buyer', label: 'Factory / Buyer', desc: 'I source raw materials for my garment factory' },
  { value: 'agent', label: 'Buying House Agent', desc: 'I source on behalf of multiple factories' },
  { value: 'supplier', label: 'Supplier / Vendor', desc: 'I supply raw materials to garment factories' },
];

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('buyer');
  const [form, setForm] = useState({ full_name: '', company_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#e2006a] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">SB</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join Supply Buddy</h1>
          <p className="text-gray-500 text-sm mt-1">RMG Supply Chain Platform</p>
        </div>

        {step === 1 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 mb-2">I am a...</p>
            {ROLES.map(r => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  role === r.value ? 'border-[#e2006a] bg-pink-50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="font-semibold text-sm text-gray-900">{r.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
              </button>
            ))}
            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#e2006a] text-white font-semibold py-2.5 rounded-full hover:bg-[#b8005a] transition-colors mt-2"
            >
              Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => update('full_name', e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e2006a]/30 focus:border-[#e2006a]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={e => update('company_name', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e2006a]/30 focus:border-[#e2006a]"
                  placeholder="Company"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e2006a]/30 focus:border-[#e2006a]"
                placeholder="Min 8 characters"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-full hover:bg-gray-50 transition-colors text-sm">
                Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-[#e2006a] text-white font-semibold py-2.5 rounded-full hover:bg-[#b8005a] transition-colors disabled:opacity-60">
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-[#e2006a] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
