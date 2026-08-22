import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, ArrowRight, AlertCircle, Lock, Mail, User, Loader2 } from 'lucide-react';

export const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle, isConfigured, isFirebaseReady } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error: signUpError } = await signUp(email, password, fullName);
    setLoading(false);
    if (signUpError) {
      setError(signUpError.includes('already registered') ? 'Email already exists. Please sign in.' : signUpError);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error: googleError } = await signInWithGoogle();
    setLoading(false);
    if (googleError) {
      setError(googleError);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#F0F0F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6C5CE7]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#6C5CE7] flex items-center justify-center shadow-xl shadow-[#6C5CE7]/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-[#F0F0F5] text-center">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-[#8B8FA3]">
          Start creating smarter content with AI.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-[#1A1D27] py-8 px-6 shadow-2xl border border-[#2E3140] rounded-2xl">
          {!isConfigured && (
            <div className="mb-4 p-3 rounded-xl bg-[#F0F0F5]/5 border border-[#2E3140] text-[#8B8FA3] text-xs">
              No auth provider configured. Running in local dev mode.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || !isConfigured}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#2E3140] bg-[#F0F0F5] text-[#0F1117] text-sm font-semibold hover:bg-white transition disabled:opacity-50 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isFirebaseReady ? 'Sign up with Google' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-[#8B8FA3] mb-6">
            <div className="h-px flex-1 bg-[#2E3140]" />
            <span>or use email</span>
            <div className="h-px flex-1 bg-[#2E3140]" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-[#8B8FA3] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B8FA3]">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#2E3140] rounded-xl bg-[#252833] text-[#F0F0F5] placeholder-[#8B8FA3] focus:outline-none focus:border-[#6C5CE7] text-sm"
                  placeholder="Alex Morgan"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8B8FA3] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B8FA3]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#2E3140] rounded-xl bg-[#252833] text-[#F0F0F5] placeholder-[#8B8FA3] focus:outline-none focus:border-[#6C5CE7] text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8B8FA3] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B8FA3]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#2E3140] rounded-xl bg-[#252833] text-[#F0F0F5] placeholder-[#8B8FA3] focus:outline-none focus:border-[#6C5CE7] text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8B8FA3] uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B8FA3]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#2E3140] rounded-xl bg-[#252833] text-[#F0F0F5] placeholder-[#8B8FA3] focus:outline-none focus:border-[#6C5CE7] text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#6C5CE7] hover:bg-[#5A4BD6] transition disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4 ml-2" /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#8B8FA3]">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#6C5CE7] hover:text-[#8B7BF0] transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
