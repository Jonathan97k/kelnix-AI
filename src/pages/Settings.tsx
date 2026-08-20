import React from 'react';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user, profile, signOut, isConfigured } = useAuth();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header><h1 className="text-3xl font-bold text-white">Settings</h1><p className="mt-1 text-slate-400">Account and workspace configuration.</p></header>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="mb-5 flex items-center gap-3"><SettingsIcon className="h-5 w-5 text-emerald-400" /><h2 className="font-bold text-white">Account</h2></div>
        <dl className="space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Name</dt><dd className="text-slate-200">{profile?.fullName || user?.email || 'Local creator'}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Email</dt><dd className="text-slate-200">{user?.email || 'Local mode'}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Cloud persistence</dt><dd className={isConfigured ? 'text-emerald-300' : 'text-amber-300'}>{isConfigured ? 'Supabase connected' : 'Local fallback'}</dd></div></dl>
        {isConfigured && <button onClick={() => signOut()} className="mt-6 flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-rose-400 hover:text-rose-300"><LogOut className="h-4 w-4" /> Sign out</button>}
      </section>
    </div>
  );
};

export default Settings;
