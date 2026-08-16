import { PhotoSlide, MusicTrack, ReelConfig } from '../types';

export const DEFAULT_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'track-lofi',
    title: 'Sunset Waves',
    artist: 'ChillHop Beats',
    genre: 'lofi',
    bpm: 90,
    mood: 'Cozy, nostalgic & mellow',
    color: '#F59E0B',
  },
  {
    id: 'track-synth',
    title: 'Midnight Drive',
    artist: 'RetroFuture',
    genre: 'synthwave',
    bpm: 120,
    mood: 'Energetic, 80s arcade & neon',
    color: '#EC4899',
  },
  {
    id: 'track-cinematic',
    title: 'Horizon Odyssey',
    artist: 'Aura Soundscapes',
    genre: 'cinematic-pulse',
    bpm: 110,
    mood: 'Emotional, epic & cinematic',
    color: '#8B5CF6',
  },
  {
    id: 'track-trap',
    title: 'Neon Hustle',
    artist: 'Urban Flow',
    genre: 'energetic-trap',
    bpm: 135,
    mood: 'Punchy, viral & fast-paced',
    color: '#EF4444',
  },
  {
    id: 'track-acoustic',
    title: 'Morning Sunbeams',
    artist: 'Warm Strings',
    genre: 'acoustic-warm',
    bpm: 100,
    mood: 'Organic, breezy & uplifting',
    color: '#10B981',
  },
  {
    id: 'track-disco',
    title: 'Golden Groove',
    artist: 'Starlight Funk',
    genre: 'disco-funk',
    bpm: 124,
    mood: 'Danceable, vibrant & playful',
    color: '#3B82F6',
  }
];

export interface PresetCollection {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  theme: string;
  defaultMusicId: string;
  socialCaption: string;
  hashtags: string;
  slides: Omit<PhotoSlide, 'id'>[];
}

export const PRESET_COLLECTIONS: PresetCollection[] = [
  {
    id: 'preset-travel',
    name: 'Amalfi Coast Dream',
    category: 'Travel & Adventure',
    icon: 'Palmtree',
    description: 'Sun-drenched cliffs, turquoise waters, and coastal romance',
    theme: 'Travel & Lifestyle',
    defaultMusicId: 'track-lofi',
    socialCaption: 'Lost somewhere between the lemon groves and azure waters. Take me back to this paradise ✨🇮🇹 Save this for your next summer moodboard!',
    hashtags: '#amalficoast #italytravel #wanderlust #cinematicreels #travelvibe #summeraesthetic #europeansummer',
    slides: [
      {
        url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1080&q=80',
        name: 'Cliffside Panorama',
        caption: 'Postcards from paradise 🌊',
        subCaption: 'Positano, Italy',
        duration: 2.4,
        motion: 'kenburns-zoom-out',
        transition: 'whip-left',
        filter: 'golden-hour',
        filterAdjustments: { brightness: 1.05, contrast: 1.05, saturation: 1.15, vignette: 0.1, blur: 0, warmth: 15 },
        textStyle: {
          font: 'serif-editorial',
          position: 'bottom',
          textColor: '#FFFFFF',
          backgroundColor: 'rgba(0,0,0,0.4)',
          animation: 'fade-up',
          fontSize: 'lg',
          hasBadge: true
        },
        narrationText: 'Waking up to the sea breeze where mountains kiss the blue Mediterranean.',
        stickers: [{ id: 's1', type: 'location', text: 'Positano, Amalfi', x: 10, y: 15 }]
      },
      {
        url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1080&q=80',
        name: 'Cobblestone Alleys',
        caption: 'Wandering without a map 🍋',
        subCaption: 'Hidden pathways',
        duration: 2.0,
        motion: 'pan-left',
        transition: 'crossfade',
        filter: 'golden-hour',
        filterAdjustments: { brightness: 1.0, contrast: 1.1, saturation: 1.1, vignette: 0.15, blur: 0, warmth: 20 },
        textStyle: {
          font: 'sans-bold',
          position: 'center',
          textColor: '#FFFBEB',
          backgroundColor: 'transparent',
          animation: 'karaoke-bounce',
          fontSize: 'xl',
          hasBadge: false
        },
        narrationText: 'Every narrow stairway leads to an unexpected view.',
        stickers: [{ id: 's2', type: 'tag', text: '✨ Slow Travel', x: 12, y: 80 }]
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80',
        name: 'Turquoise Waters',
        caption: 'Where time stands still ⛵',
        subCaption: 'Secret cove',
        duration: 2.2,
        motion: 'kenburns-zoom-in',
        transition: 'zoom-in',
        filter: 'cinematic',
        filterAdjustments: { brightness: 1.02, contrast: 1.1, saturation: 1.2, vignette: 0.2, blur: 0, warmth: 5 },
        textStyle: {
          font: 'condensed-impact',
          position: 'lower-third',
          textColor: '#FFFFFF',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          animation: 'pop-in',
          fontSize: 'lg',
          hasBadge: true
        },
        narrationText: 'Crystal clear waters that make you forget everything else.'
      },
      {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80',
        name: 'Sunset Glow',
        caption: 'Until next time, magic hour 🌅',
        subCaption: 'Golden hour bliss',
        duration: 2.6,
        motion: 'subtle-drift',
        transition: 'blur-fade',
        filter: 'golden-hour',
        filterAdjustments: { brightness: 1.05, contrast: 1.05, saturation: 1.25, vignette: 0.25, blur: 0, warmth: 25 },
        textStyle: {
          font: 'serif-editorial',
          position: 'center',
          textColor: '#FEF08A',
          backgroundColor: 'transparent',
          animation: 'subtle-float',
          fontSize: 'xl',
          hasBadge: false
        },
        narrationText: 'And just like that, another unforgettable chapter closes in gold.',
        stickers: [{ id: 's3', type: 'date', text: 'AUGUST MEMORIES', x: 50, y: 15 }]
      }
    ]
  },
  {
    id: 'preset-urban',
    name: 'Cyberpunk Tokyo',
    category: 'City & Street',
    icon: 'Zap',
    description: 'Neon reflections, rainy crosswalks, and electric night vibes',
    theme: 'Urban & Street',
    defaultMusicId: 'track-synth',
    socialCaption: 'Midnight in Neo-Tokyo. Neon rain, endless alleyways, and pure electric adrenaline ⚡🌃 Which city has your favorite night aesthetic?',
    hashtags: '#tokyonight #cyberpunk #streetphotography #neonvibes #nightwalk #aestheticreels #synthwave',
    slides: [
      {
        url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1080&q=80',
        name: 'Tokyo Tower Neon',
        caption: 'CITY LIGHTS NEVER SLEEP ⚡',
        subCaption: 'Shinjuku Night Drive',
        duration: 1.8,
        motion: 'pulse-zoom',
        transition: 'glitch',
        filter: 'cyberpunk',
        filterAdjustments: { brightness: 1.1, contrast: 1.3, saturation: 1.4, vignette: 0.3, blur: 0, warmth: -20 },
        textStyle: {
          font: 'neon-display',
          position: 'center',
          textColor: '#38BDF8',
          backgroundColor: 'transparent',
          animation: 'neon-glow',
          fontSize: 'xl',
          hasBadge: false
        },
        narrationText: 'When the sun goes down, the entire city transforms into living light.',
        stickers: [{ id: 'u1', type: 'tag', text: '⚡ 23:45 TOKYO', x: 10, y: 15 }]
      },
      {
        url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1080&q=80',
        name: 'Rain Alley Reflection',
        caption: 'Lost in neon reflections 🌧️',
        subCaption: 'Rainy Night Walk',
        duration: 2.0,
        motion: 'kenburns-zoom-in',
        transition: 'whip-right',
        filter: 'cyberpunk',
        filterAdjustments: { brightness: 1.05, contrast: 1.25, saturation: 1.3, vignette: 0.25, blur: 0, warmth: -15 },
        textStyle: {
          font: 'mono-clean',
          position: 'bottom',
          textColor: '#F43F5E',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          animation: 'pop-in',
          fontSize: 'md',
          hasBadge: true
        },
        narrationText: 'Rainwater mirrors the signs overhead, doubling the glow.'
      },
      {
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1080&q=80',
        name: 'Cyber Streets',
        caption: 'Pure electric energy 🎮',
        subCaption: 'Arcade District',
        duration: 1.9,
        motion: 'pan-right',
        transition: 'flash',
        filter: 'cyberpunk',
        filterAdjustments: { brightness: 1.1, contrast: 1.3, saturation: 1.35, vignette: 0.2, blur: 0, warmth: -10 },
        textStyle: {
          font: 'condensed-impact',
          position: 'center',
          textColor: '#A855F7',
          backgroundColor: 'transparent',
          animation: 'karaoke-bounce',
          fontSize: 'xl',
          hasBadge: false
        },
        narrationText: 'Sound, light, and motion colliding at full speed.'
      },
      {
        url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1080&q=80',
        name: 'Skyline Silhouette',
        caption: 'NIGHT CRAWLERS ONLY 🌃',
        subCaption: 'End of the line',
        duration: 2.4,
        motion: 'kenburns-zoom-out',
        transition: 'crossfade',
        filter: 'cyberpunk',
        filterAdjustments: { brightness: 1.0, contrast: 1.2, saturation: 1.2, vignette: 0.35, blur: 0, warmth: -25 },
        textStyle: {
          font: 'sans-bold',
          position: 'lower-third',
          textColor: '#FFFFFF',
          backgroundColor: 'rgba(0,0,0,0.5)',
          animation: 'fade-up',
          fontSize: 'lg',
          hasBadge: true
        },
        narrationText: 'No place in the world breathes quite like this after dark.'
      }
    ]
  },
  {
    id: 'preset-cafe',
    name: 'Slow Morning & Coffee',
    category: 'Lifestyle & Cozy',
    icon: 'Coffee',
    description: 'Warm latte art, cozy knit sweaters, reading nook, and soft sunlight',
    theme: 'Aesthetic Vlog',
    defaultMusicId: 'track-acoustic',
    socialCaption: 'Gentle mornings are non-negotiable ☕🤍 Taking time to breathe, sip slowly, and start the day with intention. How do you spend your quiet hours?',
    hashtags: '#slowmorning #coffeeaesthetic #dailyroutine #cozyvibes #softlifestyle #aestheticreels #mindfulness',
    slides: [
      {
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1080&q=80',
        name: 'Morning Espresso',
        caption: 'First sips in soft light ☕',
        subCaption: 'Quiet start',
        duration: 2.5,
        motion: 'kenburns-zoom-in',
        transition: 'crossfade',
        filter: 'pastel-warm',
        filterAdjustments: { brightness: 1.05, contrast: 0.95, saturation: 0.9, vignette: 0.1, blur: 0, warmth: 20 },
        textStyle: {
          font: 'serif-editorial',
          position: 'bottom',
          textColor: '#451A03',
          backgroundColor: 'rgba(254, 243, 199, 0.7)',
          animation: 'fade-up',
          fontSize: 'md',
          hasBadge: true
        },
        narrationText: 'There is a quiet magic in the first warm cup before the world gets busy.'
      },
      {
        url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1080&q=80',
        name: 'Reading Nook',
        caption: 'Lost in good pages 📖',
        subCaption: 'Chapter three',
        duration: 2.2,
        motion: 'pan-left',
        transition: 'slide-up',
        filter: 'vintage-film',
        filterAdjustments: { brightness: 1.0, contrast: 1.05, saturation: 0.95, vignette: 0.15, blur: 0, warmth: 15 },
        textStyle: {
          font: 'handwritten',
          position: 'center',
          textColor: '#FEF3C7',
          backgroundColor: 'transparent',
          animation: 'subtle-float',
          fontSize: 'xl',
          hasBadge: false
        },
        narrationText: 'Slowing down to appreciate simple stories and unhurried thoughts.'
      },
      {
        url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1080&q=80',
        name: 'Matcha & Pastry',
        caption: 'Little sweet moments 🥐',
        subCaption: 'Bakery run',
        duration: 2.3,
        motion: 'subtle-drift',
        transition: 'whip-left',
        filter: 'pastel-warm',
        filterAdjustments: { brightness: 1.08, contrast: 1.0, saturation: 1.05, vignette: 0.05, blur: 0, warmth: 10 },
        textStyle: {
          font: 'sans-bold',
          position: 'lower-third',
          textColor: '#1E293B',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          animation: 'pop-in',
          fontSize: 'md',
          hasBadge: true
        },
        narrationText: 'Fresh pastries and gentle conversation that fuel the spirit.'
      },
      {
        url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1080&q=80',
        name: 'Sunbeam Plants',
        caption: 'Grateful for peaceful days 🌿',
        subCaption: 'Golden warmth',
        duration: 2.7,
        motion: 'kenburns-zoom-out',
        transition: 'blur-fade',
        filter: 'golden-hour',
        filterAdjustments: { brightness: 1.05, contrast: 0.98, saturation: 1.1, vignette: 0.12, blur: 0, warmth: 25 },
        textStyle: {
          font: 'serif-editorial',
          position: 'center',
          textColor: '#FFFFFF',
          backgroundColor: 'transparent',
          animation: 'fade-up',
          fontSize: 'xl',
          hasBadge: false
        },
        narrationText: 'May your day carry the same light you felt this morning.'
      }
    ]
  },
  {
    id: 'preset-fitness',
    name: 'Peak Performance / Grind',
    category: 'Fitness & Motivation',
    icon: 'Flame',
    description: 'High octane workouts, gym motivation, and discipline highlights',
    theme: 'High Energy / Fitness',
    defaultMusicId: 'track-trap',
    socialCaption: 'The sweat today is the strength tomorrow. Consistency will always beat motivation 🔥⚡ Lock in and get the work done!',
    hashtags: '#gymmotivation #fitnessjourney #grindmode #discipline #workoutreels #gains #stayhard',
    slides: [
      {
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1080&q=80',
        name: 'Chalk & Iron',
        caption: 'NO SHORTCUTS. JUST WORK. 🔥',
        subCaption: '5:00 AM Session',
        duration: 1.8,
        motion: 'pulse-zoom',
        transition: 'flash',
        filter: 'bw-contrast',
        filterAdjustments: { brightness: 1.05, contrast: 1.45, saturation: 0, vignette: 0.35, blur: 0, warmth: 0 },
        textStyle: {
          font: 'condensed-impact',
          position: 'center',
          textColor: '#EF4444',
          backgroundColor: 'transparent',
          animation: 'karaoke-bounce',
          fontSize: 'xl',
          hasBadge: false
        },
        narrationText: 'When everybody else is sleeping, that is when the foundation gets laid.'
      },
      {
        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1080&q=80',
        name: 'Heavy Weights',
        caption: 'BUILT IN THE DARK ⚡',
        subCaption: 'Rep after rep',
        duration: 1.6,
        motion: 'kenburns-zoom-in',
        transition: 'whip-left',
        filter: 'cinematic',
        filterAdjustments: { brightness: 0.95, contrast: 1.3, saturation: 1.1, vignette: 0.4, blur: 0, warmth: -10 },
        textStyle: {
          font: 'sans-bold',
          position: 'bottom',
          textColor: '#FFFFFF',
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          animation: 'pop-in',
          fontSize: 'lg',
          hasBadge: true
        },
        narrationText: 'Every extra repetition moves you closer to the person you want to become.'
      },
      {
        url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1080&q=80',
        name: 'Post Workout Focus',
        caption: 'EARNED NOT GIVEN 🏆',
        subCaption: 'Victory mindset',
        duration: 2.2,
        motion: 'kenburns-zoom-out',
        transition: 'crossfade',
        filter: 'cinematic',
        filterAdjustments: { brightness: 1.0, contrast: 1.35, saturation: 1.15, vignette: 0.3, blur: 0, warmth: 5 },
        textStyle: {
          font: 'condensed-impact',
          position: 'center',
          textColor: '#FBBF24',
          backgroundColor: 'transparent',
          animation: 'neon-glow',
          fontSize: 'xl',
          hasBadge: false
        },
        narrationText: 'Respect the process. The results will take care of themselves.'
      }
    ]
  }
];

export function createDefaultReel(presetIndex = 0): { slides: PhotoSlide[]; config: ReelConfig } {
  const preset = PRESET_COLLECTIONS[presetIndex] || PRESET_COLLECTIONS[0];
  const music = DEFAULT_MUSIC_TRACKS.find(t => t.id === preset.defaultMusicId) || DEFAULT_MUSIC_TRACKS[0];

  const slides: PhotoSlide[] = preset.slides.map((s, idx) => ({
    ...s,
    id: `slide-${Date.now()}-${idx}`,
  }));

  const config: ReelConfig = {
    title: preset.name,
    aspectRatio: '9:16',
    theme: preset.theme,
    musicTrack: music,
    musicVolume: 0.75,
    voiceoverVolume: 0.9,
    voiceoverEnabled: false,
    voiceName: 'Kore',
    beatSync: true,
    globalOverlay: 'film-grain',
    showSocialOverlay: false,
    showPhoneFrame: true,
    socialCaption: preset.socialCaption,
    hashtags: preset.hashtags,
  };

  return { slides, config };
}
