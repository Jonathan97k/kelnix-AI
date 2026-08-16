export type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9';

export type MotionEffect = 
  | 'kenburns-zoom-in' 
  | 'kenburns-zoom-out' 
  | 'pan-left' 
  | 'pan-right' 
  | 'subtle-drift' 
  | 'pulse-zoom' 
  | 'static';

export type TransitionType = 
  | 'crossfade' 
  | 'whip-left' 
  | 'whip-right' 
  | 'zoom-in' 
  | 'glitch' 
  | 'flash' 
  | 'slide-up' 
  | 'blur-fade';

export type FilterStyle = 
  | 'normal' 
  | 'cinematic' 
  | 'golden-hour' 
  | 'vintage-film' 
  | 'cyberpunk' 
  | 'bw-contrast' 
  | 'nordic-cool' 
  | 'pastel-warm'
  | 'emerald-mood';

export type TextAnimationType = 
  | 'pop-in' 
  | 'fade-up' 
  | 'karaoke-bounce' 
  | 'neon-glow' 
  | 'typewriter' 
  | 'slide-in-right' 
  | 'subtle-float';

export type TextFontFamily = 
  | 'sans-bold' 
  | 'serif-editorial' 
  | 'neon-display' 
  | 'mono-clean' 
  | 'handwritten' 
  | 'condensed-impact';

export type TextPosition = 'top' | 'center' | 'bottom' | 'lower-third';

export interface SlideTextStyle {
  font: TextFontFamily;
  position: TextPosition;
  textColor: string;
  backgroundColor: string; // e.g. 'rgba(0,0,0,0.6)' or 'transparent'
  animation: TextAnimationType;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  hasBadge: boolean;
}

export interface FilterAdjustments {
  brightness: number; // 0.5 to 1.5, default 1.0
  contrast: number;   // 0.5 to 1.5, default 1.0
  saturation: number; // 0 to 2.0, default 1.0
  vignette: number;   // 0 to 1.0, default 0
  blur: number;       // 0 to 10px, default 0
  warmth: number;     // -50 to 50, default 0
}

export type MediaType = 'photo' | 'video';

export interface PhotoSlide {
  id: string;
  url: string;
  mediaType?: MediaType;
  videoVolume?: number; // 0 to 1
  videoTrimStart?: number; // in seconds
  videoTrimEnd?: number; // in seconds
  videoSpeed?: number; // 0.5, 1, 1.25, 1.5, 2
  thumbnailUrl?: string;
  name: string;
  caption: string;
  subCaption?: string;
  duration: number; // in seconds, e.g. 2.2
  motion: MotionEffect;
  transition: TransitionType;
  filter: FilterStyle;
  filterAdjustments?: FilterAdjustments;
  textStyle: SlideTextStyle;
  narrationText?: string;
  narrationAudioData?: string; // base64 or generated
  stickers?: Array<{
    id: string;
    type: 'location' | 'date' | 'tag' | 'music-badge' | 'custom-badge';
    text: string;
    x: number; // % 0-100
    y: number; // % 0-100
  }>;
}

export type MusicGenre = 'lofi' | 'synthwave' | 'energetic-trap' | 'chill-ambient' | 'cinematic-pulse' | 'acoustic-warm' | 'disco-funk';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: MusicGenre;
  bpm: number;
  mood: string;
  color: string;
}

export type OverlayEffect = 'none' | 'film-grain' | 'vhs-scanlines' | 'light-leak' | 'dust-scratches' | 'retro-cam';

export interface ReelConfig {
  title: string;
  aspectRatio: AspectRatio;
  theme: string;
  musicTrack: MusicTrack;
  musicVolume: number; // 0 to 1
  voiceoverVolume: number; // 0 to 1
  voiceoverEnabled: boolean;
  voiceName: string;
  beatSync: boolean;
  globalOverlay: OverlayEffect;
  showSocialOverlay: boolean;
  showPhoneFrame: boolean;
  socialCaption?: string;
  hashtags?: string;
  clientId?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  industry: string;
  brandVoice: string;
  targetAudience: string;
  keySellingPoints: string;
  callToAction: string;
  defaultHashtags: string;
  brandColor: string;
  logoUrl?: string;
  facebookPageId?: string;
  facebookPageName?: string;
  facebookAccessToken?: string;
  instagramHandle?: string;
  notes?: string;
  createdAt: string;
}
