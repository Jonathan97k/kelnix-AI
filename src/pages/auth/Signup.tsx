import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, ArrowRight, AlertCircle, Lock, Mail, User, Loader2 } from 'lucide-react';

export const Signup: React.FC = () => {
  const [f, setF] = useState('');
  const [e, setE] = useState('');
  const [p, setP] = useState('');
  const [cp, setCp] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErr(null);
    if (!f || !e || !p || !cp) { setErr('All fields required.'); return; }
    if (p !== cp) { setErr('Passwords do not match.'); return; }
    if (p.length < 6) { setErr('Password >= 6 chars.'); return; }
    setLoading(true);
    const { error } = await signUp(e, p, f);
    setLoading(false);
    if (error) {
      setErr(error.includes('already registered') ? 'Email exists. Sign in.' : error);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-xl">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-white">Create your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl">
          {!isConfigured && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              Supabase Not Configured (Local Mode)
            </div>
          )}
          {err && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {err}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Full Name</label>
              <input type="text" required value={f} onChange={ev => setF(ev.target.value)} className="block w-full px-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950 text-white text-sm focus:ring-2 focus:ring-rose-500" placeholder="Alex Morgan" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Email</label>
              <input type="email" required value={e} onChange={ev => setE(ev.target.value)} className="block w-full px-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950 text-white text-sm focus:ring-2 focus:ring-rose-500" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Password</label>
              <input type="password" required value={p} onChange={ev => setP(ev.target.value)} className="block w-full px-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950 text-white text-sm focus:ring-2 focus:ring-rose-500" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Confirm Password</label>
              <input type="password" required value={cp} onChange={ev => setCp(ev.target.value)} className="block w-full px-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950 text-white text-sm focus:ring-2 focus:ring-rose-500" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-90 transition disabled:opacity-50 mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4 ml-2" /></>}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-rose-400 hover:text-rose-300 font-medium">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
