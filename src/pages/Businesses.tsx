import React, { useEffect, useState } from 'react';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { businessService } from '../services/businesses/businessService';
import { ClientProfile } from '../types';

const emptyBusiness = (): Omit<ClientProfile, 'id' | 'createdAt'> => ({
  name: '',
  industry: '',
  brandVoice: '',
  targetAudience: '',
  keySellingPoints: '',
  callToAction: '',
  defaultHashtags: '',
  brandColor: '#E11D48',
});

const Businesses: React.FC = () => {
  const [businesses, setBusinesses] = useState<ClientProfile[]>([]);
  const [draft, setDraft] = useState(emptyBusiness);
  const [error, setError] = useState<string | null>(null);

  const loadBusinesses = async () => setBusinesses(await businessService.getMyBusinesses());
  useEffect(() => { loadBusinesses().catch(() => setError('Businesses could not be loaded.')); }, []);

  const createBusiness = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError('Enter a business name first.');
      return;
    }
    try {
      await businessService.createBusiness(draft);
      setDraft(emptyBusiness());
      setError(null);
      await loadBusinesses();
    } catch {
      setError('Business could not be saved.');
    }
  };

  const deleteBusiness = async (id: string) => {
    if (!window.confirm('Delete this business profile?')) return;
    await businessService.deleteBusiness(id);
    await loadBusinesses();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">Businesses</h1>
        <p className="mt-1 text-slate-400">Keep brand voice, audience, and campaign context ready for AI generation.</p>
      </header>

      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <form onSubmit={createBusiness} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white"><Plus className="h-4 w-4 text-emerald-400" /> Add business</div>
          {(['name', 'industry', 'brandVoice', 'targetAudience', 'keySellingPoints', 'callToAction', 'defaultHashtags'] as const).map((field) => (
            <input
              key={field}
              value={draft[field]}
              onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
              placeholder={field.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (letter) => letter.toUpperCase())}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          ))}
          <button type="submit" className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-400">Save business</button>
        </form>

        <section className="space-y-3">
          {businesses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">No business profiles yet.</div>
          ) : businesses.map((business) => (
            <article key={business.id} className="flex items-start justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300"><Building2 className="h-5 w-5" /></div>
                <div>
                  <h2 className="font-bold text-white">{business.name}</h2>
                  <p className="text-sm text-slate-400">{business.industry || 'Industry not set'}</p>
                  {business.brandVoice && <p className="mt-2 text-xs text-slate-500">Voice: {business.brandVoice}</p>}
                </div>
              </div>
              <button onClick={() => deleteBusiness(business.id)} className="p-2 text-slate-500 hover:text-rose-300" title="Delete business"><Trash2 className="h-4 w-4" /></button>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Businesses;
