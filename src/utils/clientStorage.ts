import { ClientProfile } from '../types';

const CLIENTS_STORAGE_KEY = 'reelcraft_clients_v1';
const ACTIVE_CLIENT_KEY = 'reelcraft_active_client_id_v1';

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'client-1-fashion',
    name: 'Aura Luxe Boutique',
    industry: 'Fashion & High-End Apparel',
    brandVoice: 'Chic, Minimalist, Luxury & Aesthetic',
    targetAudience: 'Fashion-forward women aged 22-38 looking for timeless elegance and capsule wardrobes',
    keySellingPoints: 'Sustainable organic silk, limited edition artisanal drops, free express worldwide shipping',
    callToAction: 'Tap link in bio to shop the New Capsule Drop before it sells out!',
    defaultHashtags: '#AuraLuxe #CapsuleWardrobe #LuxuryStyle #OOTDInspo #QuietLuxury #SustainableFashion',
    brandColor: '#E11D48',
    facebookPageName: 'Aura Luxe Official',
    facebookPageId: 'auraluxeboutique',
    instagramHandle: '@auraluxe',
    notes: 'Prefers golden-hour tones, elegant serif typography, and soft poetic hooks.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'client-2-fitness',
    name: 'IronPeak High-Performance Gym',
    industry: 'Fitness, Athletics & Nutrition',
    brandVoice: 'High-Energy, Bold, No-Excuses, Motivating',
    targetAudience: 'Athletes, gymgoers, and busy professionals wanting intense body transformations',
    keySellingPoints: 'State-of-the-art Olympic equipment, 1-on-1 certified coaching, 24/7 access',
    callToAction: 'Comment "TRANSFORM" or DM us to claim your 7-Day VIP Guest Pass!',
    defaultHashtags: '#IronPeakGym #FitnessMotivation #GymGrind #BodyTransformation #AthleteLifestyle #NoExcuses',
    brandColor: '#2563EB',
    facebookPageName: 'IronPeak Performance Center',
    facebookPageId: 'ironpeakfitness',
    instagramHandle: '@ironpeakgym',
    notes: 'Focus on high-contrast punchy captions, fast glitch transitions, and driving DM comments.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'client-3-realestate',
    name: 'Vanguard Luxury Real Estate',
    industry: 'Real Estate & Property Investment',
    brandVoice: 'Prestigious, Trustworthy, Exclusive & Sophisticated',
    targetAudience: 'High-net-worth property investors, luxury home buyers, modern architectural enthusiasts',
    keySellingPoints: 'Exclusive off-market penthouses, panoramic oceanfront views, prime city locations',
    callToAction: 'Send a direct message or visit vanguardhomes.com for private VIP walkthrough tours.',
    defaultHashtags: '#LuxuryRealEstate #DreamHome #PenthouseLiving #ArchitectureInspo #PropertyTour #MillionDollarListing',
    brandColor: '#D97706',
    facebookPageName: 'Vanguard Luxury Properties',
    facebookPageId: 'vanguardluxuryrealty',
    instagramHandle: '@vanguardluxury',
    notes: 'Emphasize architectural details, sweeping slow camera pans, and prestige value.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'client-4-cafe',
    name: 'Velvet Bean Artisan Roasters',
    industry: 'Café, Coffee & Gourmet Bakery',
    brandVoice: 'Cozy, Warm, Welcoming, Sensory & Foodie-focused',
    targetAudience: 'Coffee connoisseurs, remote workers, weekend brunch lovers, students',
    keySellingPoints: 'Single-origin Ethiopian roast, fresh sourdough pastries baked daily at 6 AM, pet-friendly patio',
    callToAction: 'Tag your morning coffee buddy and come grab our fresh cinnamon babka this morning! ☕✨',
    defaultHashtags: '#VelvetBeanCoffee #SpecialtyCoffee #BaristaDaily #CoffeeLovers #BrunchSpots #MorningVibes',
    brandColor: '#84CC16',
    facebookPageName: 'Velvet Bean Coffeehouse',
    facebookPageId: 'velvetbeancoffee',
    instagramHandle: '@velvetbeancoffee',
    notes: 'Use warm pastel grading, playful chill vibes, and sensory descriptions of flavors.',
    createdAt: new Date().toISOString(),
  }
];

export function getSavedClients(): ClientProfile[] {
  try {
    const saved = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved clients from localStorage', err);
  }
  // Save initial demo clients
  saveClients(INITIAL_CLIENTS);
  return INITIAL_CLIENTS;
}

export function saveClients(clients: ClientProfile[]): void {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (err) {
    console.error('Failed to save clients to localStorage', err);
  }
}

export function getActiveClientId(): string {
  try {
    const active = localStorage.getItem(ACTIVE_CLIENT_KEY);
    if (active) return active;
  } catch (err) {
    console.warn('Failed to read active client ID', err);
  }
  return INITIAL_CLIENTS[0].id;
}

export function setActiveClientId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_CLIENT_KEY, id);
  } catch (err) {
    console.error('Failed to save active client ID', err);
  }
}
