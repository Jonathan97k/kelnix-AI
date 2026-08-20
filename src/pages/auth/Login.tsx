import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, ArrowRight, AlertCircle, Lock, Mail, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);

    if (signInError) {
      let friendlyMsg = signInError;
      if (signInError.includes('Invalid login credentials')) {
        friendlyMsg = 'Invalid email or password. Please check your credentials and try again.';
      }
      setError(friendlyMsg);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-rose-600/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sign in to continue creating smarter content.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl sm:px-10">
          {!isConfigured && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>Supabase Not Configured. Running in local dev mode.</div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <button
              type="button"
              onClick={async () => {
                setError(null);
                setLoading(true);
                const { error: googleError } = await signInWithGoogle();
                setLoading(false);
                if (googleError) setError(googleError);
              }}
              disabled={loading || !isConfigured}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-700 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition disabled:opacity-50"
            >
              Continue with Google
            </button>

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-500">
              <div className="h-px flex-1 bg-slate-800" />
              <span>or use email</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-950/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-950/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-rose-600/30 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-rose-400 hover:text-rose-300 transition">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
