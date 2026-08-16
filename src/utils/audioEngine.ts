import { MusicGenre, MusicTrack } from '../types';

class ReelAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrack: MusicTrack | null = null;
  private musicVolume: number = 0.75;
  private voiceVolume: number = 0.9;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private timerId: number | null = null;
  private beatStep: number = 0;
  private beatCallback: ((beatNumber: number) => void) | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    // Lazy audio context creation on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.voiceGain = this.ctx.createGain();

      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.voiceGain.gain.setValueAtTime(this.voiceVolume, this.ctx.currentTime);

      this.musicGain.connect(this.masterGain);
      this.voiceGain.connect(this.masterGain);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setVoiceVolume(val: number) {
    this.voiceVolume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.voiceGain) {
      this.voiceGain.gain.setTargetAtTime(this.voiceVolume, this.ctx.currentTime, 0.05);
    }
  }

  public onBeat(callback: (beatNumber: number) => void) {
    this.beatCallback = callback;
  }

  public play(track: MusicTrack) {
    this.initContext();
    if (!this.ctx) return;

    this.currentTrack = track;
    this.isPlaying = true;
    this.beatStep = 0;

    const intervalMs = (60 / track.bpm) * 1000;
    this.stopLoop();

    // Trigger procedural beat generation
    this.scheduleStep(track);
    this.timerId = window.setInterval(() => {
      if (this.isPlaying && this.currentTrack) {
        this.scheduleStep(this.currentTrack);
      }
    }, intervalMs / 2); // 8th notes
  }

  public pause() {
    this.isPlaying = false;
    this.stopLoop();
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }

  public stop() {
    this.isPlaying = false;
    this.stopLoop();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  private stopLoop() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleStep(track: MusicTrack) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const step = this.beatStep % 16;
    const genre = track.genre;

    // Call beat callback on main beats (quarter notes)
    if (step % 2 === 0) {
      this.beatCallback?.(step / 2);
    }

    try {
      this.renderRhythm(genre, step, now);
    } catch (e) {
      console.warn("Audio render note error", e);
    }

    this.beatStep++;
  }

  private renderRhythm(genre: MusicGenre, step: number, time: number) {
    if (!this.ctx || !this.musicGain) return;

    switch (genre) {
      case 'synthwave':
        // Bass kick on 0, 4, 8, 12
        if (step % 4 === 0) {
          this.playKick(time, 130, 0.4);
        }
        // Snare / Clap on 4, 12
        if (step === 4 || step === 12) {
          this.playSnare(time, 0.3);
        }
        // Retro synth arp on every step
        const synthNotes = [220, 261.63, 329.63, 392.0, 440, 523.25];
        const note = synthNotes[step % synthNotes.length];
        this.playSynthNote(time, note, 'sawtooth', 0.12, 0.15);
        // Hi-hat
        if (step % 2 === 1) {
          this.playHiHat(time, 0.08);
        }
        break;

      case 'lofi':
        // Mellow kick on 0, 6, 10
        if (step === 0 || step === 6 || step === 10) {
          this.playKick(time, 90, 0.3);
        }
        // Soft rimshot on 4, 12
        if (step === 4 || step === 12) {
          this.playSnare(time, 0.18, 180);
        }
        // Warm Rhodes chord progression
        if (step === 0 || step === 8) {
          const chords = step === 0 ? [261.63, 329.63, 392.0, 493.88] : [220.0, 261.63, 329.63, 440.0];
          chords.forEach(f => this.playSynthNote(time, f, 'sine', 0.8, 0.08));
        }
        // Vinyl scratch / shakers
        if (step % 2 === 1) {
          this.playHiHat(time, 0.05, 0.04);
        }
        break;

      case 'energetic-trap':
        // Heavy 808 sub kick
        if (step === 0 || step === 6 || step === 10 || step === 14) {
          this.play808(time, 0.45);
        }
        // Sharp clap on 4, 12
        if (step === 4 || step === 12) {
          this.playSnare(time, 0.35, 300);
        }
        // Fast trap hi-hats with roll
        if (step === 14 || step === 15) {
          this.playHiHat(time, 0.12, 0.03);
        } else {
          this.playHiHat(time, 0.08, 0.04);
        }
        // Pluck melody
        if (step % 4 === 0) {
          this.playSynthNote(time, 587.33, 'square', 0.2, 0.1);
        }
        break;

      case 'cinematic-pulse':
        // Deep taiko boom
        if (step === 0 || step === 8) {
          this.playKick(time, 70, 0.5);
        }
        // Pulsing cinematic sub
        const pulseNotes = [110, 110, 130.81, 146.83];
        this.playSynthNote(time, pulseNotes[Math.floor(step / 4)], 'triangle', 0.3, 0.2);
        // High shimmering pulse
        if (step % 2 === 0) {
          this.playSynthNote(time, 659.25, 'sine', 0.15, 0.06);
        }
        break;

      case 'acoustic-warm':
        // Warm acoustic kick
        if (step === 0 || step === 8) {
          this.playKick(time, 95, 0.25);
        }
        // Finger snap
        if (step === 4 || step === 12) {
          this.playSnare(time, 0.15, 450);
        }
        // Guitar strum arpeggio
        const acousticNotes = [329.63, 392.0, 493.88, 587.33];
        this.playSynthNote(time, acousticNotes[step % 4], 'triangle', 0.25, 0.1);
        break;

      case 'disco-funk':
      default:
        // Four on the floor kick
        if (step % 4 === 0) {
          this.playKick(time, 120, 0.35);
        }
        // Disco snare on 4, 12
        if (step === 4 || step === 12) {
          this.playSnare(time, 0.25);
        }
        // Off-beat open hi-hat
        if (step % 4 === 2) {
          this.playHiHat(time, 0.15, 0.12);
        } else if (step % 2 === 0) {
          this.playHiHat(time, 0.06, 0.03);
        }
        // Funky bassline
        const bassNotes = [110, 130.81, 146.83, 164.81, 110, 146.83, 164.81, 196];
        this.playSynthNote(time, bassNotes[step % bassNotes.length], 'sawtooth', 0.18, 0.18);
        break;
    }
  }

  // Instrument sound synthesizers
  private playKick(time: number, startFreq = 120, gainVal = 0.3) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.18);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.22);
  }

  private play808(time: number, gainVal = 0.4) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.08);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.48);
  }

  private playSnare(time: number, gainVal = 0.25, noiseFreq = 250) {
    if (!this.ctx || !this.musicGain) return;
    // Tone component
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(noiseFreq, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
    oscGain.gain.setValueAtTime(gainVal * 0.7, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.12);

    // White noise snap
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(gainVal, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + 0.13);
  }

  private playHiHat(time: number, gainVal = 0.08, duration = 0.05) {
    if (!this.ctx || !this.musicGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + duration + 0.01);
  }

  private playSynthNote(time: number, freq: number, type: OscillatorType = 'sine', duration = 0.2, gainVal = 0.1) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(gainVal, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  // Voiceover narration speech synthesis
  public speakNarration(text: string, voiceName?: string) {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Duck background music slightly for clear narration
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.35, this.ctx.currentTime, 0.1);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = this.voiceVolume;

    // Pick suitable voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }
    }

    utterance.onend = () => {
      // Restore background music level
      if (this.ctx && this.musicGain && this.isPlaying) {
        this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.3);
      }
    };

    utterance.onerror = () => {
      if (this.ctx && this.musicGain && this.isPlaying) {
        this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.3);
      }
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  // Audio frequency analyser for live waveforms
  public getVisualizerData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(16);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
}

export const audioEngine = new ReelAudioEngine();
