import { ClientProfile } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const FALLBACK_USER_ID = '00000000-0000-0000-0000-000000000001';

async function getCurrentUserId(): Promise<string> {
	if (!isSupabaseConfigured || !supabase) return FALLBACK_USER_ID;
	const { data: { user } } = await supabase.auth.getUser();
	return user?.id || FALLBACK_USER_ID;
}

function mapRow(row: any): ClientProfile {
	return {
		id: row.id,
		name: row.name || 'Untitled Business',
		industry: row.industry || '',
		brandVoice: row.brand_voice || '',
		targetAudience: row.target_audience || '',
		keySellingPoints: row.key_selling_points || '',
		callToAction: row.call_to_action || '',
		defaultHashtags: row.default_hashtags || '',
		brandColor: row.brand_color || '#E11D48',
		logoUrl: row.logo_url || undefined,
		facebookPageName: row.facebook_page_name || undefined,
		facebookPageId: row.facebook_page_id || undefined,
		instagramHandle: row.instagram_handle || undefined,
		notes: row.notes || undefined,
		createdAt: row.created_at || new Date().toISOString(),
	};
}

function getLocalBusinesses(): ClientProfile[] {
	try {
		const saved = localStorage.getItem('kelnix_businesses_v1');
		return saved ? JSON.parse(saved) : [];
	} catch {
		return [];
	}
}

export const businessService = {
	async getMyBusinesses(): Promise<ClientProfile[]> {
		if (!isSupabaseConfigured || !supabase) return getLocalBusinesses();

		try {
			const { data, error } = await supabase.from('businesses').select('*').order('created_at', { ascending: false });
			if (error || !data) return getLocalBusinesses();
			const businesses = data.map(mapRow);
			localStorage.setItem('kelnix_businesses_v1', JSON.stringify(businesses));
			return businesses;
		} catch {
			return getLocalBusinesses();
		}
	},

	async createBusiness(business: Omit<ClientProfile, 'id' | 'createdAt'>): Promise<ClientProfile> {
		const created: ClientProfile = { ...business, id: `business-${Date.now()}`, createdAt: new Date().toISOString() };
		if (isSupabaseConfigured && supabase) {
			const { data, error } = await supabase.from('businesses').insert({
				user_id: await getCurrentUserId(),
				name: business.name,
				industry: business.industry,
				brand_voice: business.brandVoice,
				target_audience: business.targetAudience,
				key_selling_points: business.keySellingPoints,
				call_to_action: business.callToAction,
				default_hashtags: business.defaultHashtags,
				brand_color: business.brandColor,
				logo_url: business.logoUrl || null,
				notes: business.notes || null,
			}).select().single();
			if (!error && data) return mapRow(data);
		}
		const all = getLocalBusinesses();
		localStorage.setItem('kelnix_businesses_v1', JSON.stringify([created, ...all]));
		return created;
	},

	async updateBusiness(id: string, updates: Partial<ClientProfile>): Promise<ClientProfile> {
		const all = await this.getMyBusinesses();
		const current = all.find((business) => business.id === id);
		if (!current) throw new Error('Business not found');
		const updated = { ...current, ...updates };
		if (isSupabaseConfigured && supabase) {
			await supabase.from('businesses').update({
				name: updated.name,
				industry: updated.industry,
				brand_voice: updated.brandVoice,
				target_audience: updated.targetAudience,
				key_selling_points: updated.keySellingPoints,
				call_to_action: updated.callToAction,
				default_hashtags: updated.defaultHashtags,
				brand_color: updated.brandColor,
				logo_url: updated.logoUrl || null,
				notes: updated.notes || null,
			}).eq('id', id);
		}
		localStorage.setItem('kelnix_businesses_v1', JSON.stringify(all.map((business) => business.id === id ? updated : business)));
		return updated;
	},

	async deleteBusiness(id: string): Promise<void> {
		if (isSupabaseConfigured && supabase) await supabase.from('businesses').delete().eq('id', id);
		localStorage.setItem('kelnix_businesses_v1', JSON.stringify(getLocalBusinesses().filter((business) => business.id !== id)));
	},
};
