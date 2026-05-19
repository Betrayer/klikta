import { Howl, Howler } from "howler";
import musicUrl from "../../assets/audio/music/music_synthwave_loop_1.mp3";
import { useSettingsStore, type SettingsState } from "../../state/settingsStore";

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

const sfxUrls = import.meta.glob("../../assets/audio/sfx/*.ogg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const baseName = (path: string): string => {
  const file = path.split("/").pop() ?? path;
  return file.replace(/\.ogg$/, "");
};

const variantGroup = (name: string): string => {
  const match = /^(.*)_\d+$/.exec(name);
  return match !== null && match[1] !== undefined ? match[1] : name;
};

const FILTER_MIN_HZ = 500;
const FILTER_MAX_HZ = 20000;
const INTENSITY_RAMP_S = 0.4;
const GAMEOVER_FREQ_HZ = 300;
const GAMEOVER_FADE_S = 1;
const GAMEOVER_GAIN_MUL = 0.4;
const SWELL_S = 0.2;
const SWELL_GAIN_MUL = 1.25;

class AudioSystem {
  private masterVolume = 1;
  private sfxVolume = 0.9;
  private musicVolume = 0.5;
  private musicIntensity = 0;
  private musicPlaying = false;
  private wantMusic = false;

  private readonly sfx = new Map<string, Howl[]>();
  private readonly ctx: AudioContext | null;
  private musicBuffer: AudioBuffer | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private musicGain: GainNode | null = null;

  constructor() {
    for (const [path, url] of Object.entries(sfxUrls)) {
      const group = variantGroup(baseName(path));
      const howl = new Howl({ src: [url], format: ["ogg"] });
      const existing = this.sfx.get(group);
      if (existing !== undefined) existing.push(howl);
      else this.sfx.set(group, [howl]);
    }

    Howler.autoSuspend = false;
    this.ctx = Howler.ctx ?? null;

    const applySettings = (s: SettingsState): void => {
      this.setMasterVolume(s.masterVolume);
      this.setSFXVolume(s.sfxVolume);
      this.setMusicVolume(s.musicVolume);
    };
    applySettings(useSettingsStore.getState());
    useSettingsStore.subscribe(applySettings);

    void this.loadMusic();
  }

  setPaused(paused: boolean): void {
    if (this.ctx === null) return;
    if (paused) void this.ctx.suspend();
    else void this.ctx.resume();
  }

  private async loadMusic(): Promise<void> {
    if (this.ctx === null) return;
    const response = await fetch(musicUrl);
    const encoded = await response.arrayBuffer();
    this.musicBuffer = await this.ctx.decodeAudioData(encoded);
    if (this.wantMusic && !this.musicPlaying) this.playMusicNow();
  }

  playSFX(name: string): void {
    const list = this.sfx.get(name);
    if (list === undefined || list.length === 0) return;
    const howl = list[Math.floor(Math.random() * list.length)];
    if (howl === undefined) return;
    howl.volume(this.effectiveSfx());
    howl.play();
  }

  startMusic(): void {
    this.wantMusic = true;
    if (this.musicPlaying) return;
    this.playMusicNow();
  }

  stopMusic(): void {
    this.wantMusic = false;
    if (!this.musicPlaying) return;
    this.musicSource?.stop();
    this.musicSource?.disconnect();
    this.musicFilter?.disconnect();
    this.musicGain?.disconnect();
    this.musicSource = null;
    this.musicFilter = null;
    this.musicGain = null;
    this.musicPlaying = false;
  }

  setMusicIntensity(level: number): void {
    this.musicIntensity = clamp01(level);
    if (this.ctx === null || this.musicFilter === null || this.musicGain === null) {
      return;
    }
    const now = this.ctx.currentTime;
    this.musicFilter.frequency.cancelScheduledValues(now);
    this.musicFilter.frequency.linearRampToValueAtTime(
      this.filterFreq(),
      now + INTENSITY_RAMP_S,
    );
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.linearRampToValueAtTime(
      this.effectiveMusic(),
      now + INTENSITY_RAMP_S,
    );
  }

  musicSwell(): void {
    if (this.ctx === null || this.musicGain === null) return;
    const now = this.ctx.currentTime;
    const base = this.effectiveMusic();
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(base, now);
    this.musicGain.gain.linearRampToValueAtTime(
      base * SWELL_GAIN_MUL,
      now + SWELL_S * 0.4,
    );
    this.musicGain.gain.linearRampToValueAtTime(base, now + SWELL_S);
  }

  musicGameOver(): void {
    if (this.ctx === null || this.musicFilter === null || this.musicGain === null) {
      return;
    }
    const now = this.ctx.currentTime;
    this.musicFilter.frequency.cancelScheduledValues(now);
    this.musicFilter.frequency.linearRampToValueAtTime(
      GAMEOVER_FREQ_HZ,
      now + GAMEOVER_FADE_S,
    );
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.linearRampToValueAtTime(
      this.effectiveMusic() * GAMEOVER_GAIN_MUL,
      now + GAMEOVER_FADE_S,
    );
  }

  setMasterVolume(v: number): void {
    this.masterVolume = clamp01(v);
    this.applyMusicGain();
  }

  setSFXVolume(v: number): void {
    this.sfxVolume = clamp01(v);
  }

  setMusicVolume(v: number): void {
    this.musicVolume = clamp01(v);
    this.applyMusicGain();
  }

  private playMusicNow(): void {
    if (this.ctx === null || this.musicBuffer === null) return;
    const ctx = this.ctx;

    const source = ctx.createBufferSource();
    source.buffer = this.musicBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = this.filterFreq();

    const gain = ctx.createGain();
    gain.gain.value = this.effectiveMusic();

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();

    this.musicSource = source;
    this.musicFilter = filter;
    this.musicGain = gain;
    this.musicPlaying = true;
  }

  private applyMusicGain(): void {
    if (this.ctx === null || this.musicGain === null) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.linearRampToValueAtTime(this.effectiveMusic(), now + 0.1);
  }

  private filterFreq(): number {
    return FILTER_MIN_HZ + (FILTER_MAX_HZ - FILTER_MIN_HZ) * this.musicIntensity;
  }

  private effectiveSfx(): number {
    return this.masterVolume * this.sfxVolume;
  }

  private effectiveMusic(): number {
    return this.masterVolume * this.musicVolume;
  }
}

export const audioSystem = new AudioSystem();
