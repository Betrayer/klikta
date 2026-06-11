import { Howl, Howler } from "howler";
import {
  useSettingsStore,
  type SettingsState,
} from "../../state/settingsStore";
import { useMetaStore } from "../../state/metaStore";
import {
  getActiveMusicPack,
  getActiveSfxPack,
} from "../../state/themeSelectors";
import { DEFAULT_SOUND_PACK } from "../../data/sound";
import type { SoundPack } from "../../data/themes/types";

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

const extOf = (src: string): string | undefined => {
  const clean = src.split("?")[0] ?? src;
  const ext = clean.split(".").pop();
  return ext !== undefined && ext.length > 0 ? ext : undefined;
};

const formatsOf = (srcs: string[]): string[] | undefined => {
  const exts: string[] = [];
  for (const src of srcs) {
    const ext = extOf(src);
    if (ext === undefined) return undefined;
    exts.push(ext);
  }
  return exts;
};

const FILTER_MIN_HZ = 500;
const FILTER_MAX_HZ = 20000;
const INTENSITY_RAMP_S = 0.4;
const GAMEOVER_FREQ_HZ = 300;
const GAMEOVER_FADE_S = 1;
const GAMEOVER_GAIN_MUL = 0.4;
const SWELL_S = 0.2;
const SWELL_GAIN_MUL = 1.25;
const MUSIC_CROSSFADE_S = 0.8;
const SILENT_GAIN = 0.0001;

class AudioSystem {
  private masterVolume = 1;
  private sfxVolume = 0.9;
  private musicVolume = 0.5;
  private musicIntensity = 0;
  private musicPlaying = false;
  private wantMusic = false;
  private sfxPackGain = 1;
  private sfxPackRate = 1;
  private musicPackGain = 1;
  private musicPackRate = 1;

  private sfx = new Map<string, Howl[]>();
  private loadedSfxPackId: string | null = null;
  private readonly sfxCache = new Map<string, Map<string, Howl[]>>();

  private readonly ctx: AudioContext | null;
  private musicBuffer: AudioBuffer | null = null;
  private loadedMusicPackId: string | null = null;
  private readonly musicBufferCache = new Map<string, AudioBuffer>();
  private readonly musicDecodes = new Map<string, Promise<AudioBuffer>>();
  private musicSource: AudioBufferSourceNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private musicGain: GainNode | null = null;

  constructor() {
    Howler.autoSuspend = false;
    void this.loadSfxPack(getActiveSfxPack());
    this.ctx = Howler.ctx ?? null;

    const applySettings = (s: SettingsState): void => {
      this.setMasterVolume(s.masterVolume);
      this.setSFXVolume(s.sfxVolume);
      this.setMusicVolume(s.musicVolume);
    };
    applySettings(useSettingsStore.getState());
    useSettingsStore.subscribe(applySettings);

    void this.loadMusicPack(getActiveMusicPack());

    useMetaStore.subscribe((state, prev) => {
      if (state.activeSfxPackId !== prev.activeSfxPackId) {
        void this.loadSfxPack(getActiveSfxPack());
      }
      if (state.activeMusicPackId !== prev.activeMusicPackId) {
        void this.loadMusicPack(getActiveMusicPack());
      }
    });
  }

  async loadActivePacks(): Promise<void> {
    await Promise.all([
      this.loadSfxPack(getActiveSfxPack()),
      this.loadMusicPack(getActiveMusicPack()),
    ]);
  }

  arePacksLoaded(): boolean {
    const sfx = getActiveSfxPack();
    const music = getActiveMusicPack();
    const sfxReady =
      sfx.id === DEFAULT_SOUND_PACK.id || this.loadedSfxPackId === sfx.id;
    const musicReady =
      music.id === DEFAULT_SOUND_PACK.id || this.loadedMusicPackId === music.id;
    return sfxReady && musicReady;
  }

  async loadSfxPack(pack: SoundPack): Promise<void> {
    this.sfxPackGain = pack.gain ?? 1;
    this.sfxPackRate = pack.rate ?? 1;
    let map = this.sfxCache.get(pack.id);
    if (map === undefined) {
      map = this.buildSfx(pack);
      this.sfxCache.set(pack.id, map);
    }
    this.sfx = map;
    this.loadedSfxPackId = pack.id;
    try {
      await this.awaitSfxMap(map);
    } catch {
      if (pack.id !== DEFAULT_SOUND_PACK.id) {
        this.sfxCache.delete(pack.id);
        await this.loadSfxPack(DEFAULT_SOUND_PACK);
      }
    }
  }

  async loadMusicPack(pack: SoundPack): Promise<void> {
    this.musicPackGain = pack.gain ?? 1;
    this.musicPackRate = pack.rate ?? 1;
    const ctx = this.ctx;
    if (ctx === null) {
      this.loadedMusicPackId = pack.id;
      return;
    }
    try {
      const buffer = await this.decodeMusic(pack, ctx);
      this.applyMusicBuffer(buffer, pack.id);
    } catch {
      if (pack.id !== DEFAULT_SOUND_PACK.id) {
        await this.loadMusicPack(DEFAULT_SOUND_PACK);
      }
    }
  }

  setPaused(paused: boolean): void {
    if (this.ctx === null) return;
    if (paused) void this.ctx.suspend();
    else void this.ctx.resume();
  }

  playSFX(name: string, seq?: { index: number; total: number }): void {
    const list = this.sfx.get(name);
    if (list === undefined || list.length === 0) return;
    const pick =
      seq !== undefined
        ? Math.min(
            Math.max(list.length - seq.total + seq.index, 0),
            list.length - 1,
          )
        : Math.floor(Math.random() * list.length);
    const howl = list[pick];
    if (howl === undefined) return;
    howl.volume(this.effectiveSfx() * this.sfxPackGain);
    howl.rate(this.sfxPackRate);
    howl.play();
  }

  playTimerTick(): void {
    if (this.ctx === null) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1040, now);
    const peak = this.effectiveSfx() * 0.35;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  startMusic(): void {
    this.wantMusic = true;
    if (this.musicPlaying) return;
    if (this.musicBuffer !== null) this.playMusicNow();
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
    if (
      this.ctx === null ||
      this.musicFilter === null ||
      this.musicGain === null
    ) {
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
    if (
      this.ctx === null ||
      this.musicFilter === null ||
      this.musicGain === null
    ) {
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

  private buildSfx(pack: SoundPack): Map<string, Howl[]> {
    const map = new Map<string, Howl[]>();
    for (const [name, variants] of Object.entries(pack.sfx)) {
      map.set(
        name,
        variants
          .filter((srcs) => srcs.length > 0)
          .map((srcs) => new Howl({ src: srcs, format: formatsOf(srcs) })),
      );
    }
    return map;
  }

  private async awaitSfxMap(map: Map<string, Howl[]>): Promise<void> {
    const pending: Promise<void>[] = [];
    for (const howls of map.values()) {
      for (const howl of howls) pending.push(this.awaitHowl(howl));
    }
    await Promise.all(pending);
  }

  private awaitHowl(howl: Howl): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (howl.state() === "loaded") {
        resolve();
        return;
      }
      howl.once("load", () => resolve());
      howl.once("loaderror", (_id, error) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }

  private decodeMusic(
    pack: SoundPack,
    ctx: AudioContext,
  ): Promise<AudioBuffer> {
    const cached = this.musicBufferCache.get(pack.id);
    if (cached !== undefined) return Promise.resolve(cached);
    const inflight = this.musicDecodes.get(pack.id);
    if (inflight !== undefined) return inflight;
    const decode = (async (): Promise<AudioBuffer> => {
      try {
        const response = await fetch(pack.music.src);
        const encoded = await response.arrayBuffer();
        const buffer = await ctx.decodeAudioData(encoded);
        this.musicBufferCache.set(pack.id, buffer);
        return buffer;
      } finally {
        this.musicDecodes.delete(pack.id);
      }
    })();
    this.musicDecodes.set(pack.id, decode);
    return decode;
  }

  private applyMusicBuffer(buffer: AudioBuffer, packId: string): void {
    this.musicBuffer = buffer;
    this.loadedMusicPackId = packId;
    if (this.musicPlaying) this.crossfadeTo(buffer);
    else if (this.wantMusic) this.playMusicNow();
  }

  private playMusicNow(): void {
    if (this.ctx === null || this.musicBuffer === null) return;
    const chain = this.buildMusicChain(
      this.ctx,
      this.musicBuffer,
      this.effectiveMusic(),
    );
    this.musicSource = chain.source;
    this.musicFilter = chain.filter;
    this.musicGain = chain.gain;
    this.musicPlaying = true;
  }

  private crossfadeTo(buffer: AudioBuffer): void {
    if (this.ctx === null) return;
    const ctx = this.ctx;
    const oldSource = this.musicSource;
    const oldFilter = this.musicFilter;
    const oldGain = this.musicGain;

    const chain = this.buildMusicChain(ctx, buffer, SILENT_GAIN);
    this.musicSource = chain.source;
    this.musicFilter = chain.filter;
    this.musicGain = chain.gain;

    const now = ctx.currentTime;
    chain.gain.gain.linearRampToValueAtTime(
      this.effectiveMusic(),
      now + MUSIC_CROSSFADE_S,
    );
    if (oldGain !== null) {
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.linearRampToValueAtTime(
        SILENT_GAIN,
        now + MUSIC_CROSSFADE_S,
      );
    }
    window.setTimeout(
      () => {
        oldSource?.stop();
        oldSource?.disconnect();
        oldFilter?.disconnect();
        oldGain?.disconnect();
      },
      MUSIC_CROSSFADE_S * 1000 + 60,
    );
  }

  private buildMusicChain(
    ctx: AudioContext,
    buffer: AudioBuffer,
    gainValue: number,
  ): {
    source: AudioBufferSourceNode;
    filter: BiquadFilterNode;
    gain: GainNode;
  } {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.playbackRate.value = this.musicPackRate;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = this.filterFreq();

    const gain = ctx.createGain();
    gain.gain.value = gainValue;

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
    return { source, filter, gain };
  }

  private applyMusicGain(): void {
    if (this.ctx === null || this.musicGain === null) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.linearRampToValueAtTime(
      this.effectiveMusic(),
      now + 0.1,
    );
  }

  private filterFreq(): number {
    return (
      FILTER_MIN_HZ + (FILTER_MAX_HZ - FILTER_MIN_HZ) * this.musicIntensity
    );
  }

  private effectiveSfx(): number {
    return this.masterVolume * this.sfxVolume;
  }

  private effectiveMusic(): number {
    return this.masterVolume * this.musicVolume * this.musicPackGain;
  }
}

export const audioSystem = new AudioSystem();
