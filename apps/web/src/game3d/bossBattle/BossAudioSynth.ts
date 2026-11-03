/**
 * BossAudioSynth: Pembangkit SFX Web Audio API prosedural hemat memori (0 bytes file audio).
 * Menghasilkan suara tembakan laser, ledakan benturan, dan suara kemenangan kelas
 * secara lembut dan aman untuk pengeras suara proyektor kelas.
 */
export class BossAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // Muat preferensi bisu (mute) dari localStorage bila ada
    try {
      const saved = localStorage.getItem('belajarena_boss_audio_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  private initContext(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : 0.12; // Volume pelan & ramah kelas
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('belajarena_boss_audio_muted', String(muted));
    } catch {}

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Suara tembakan laser siswa (frekuensi sweep menurun cepat)
   */
  public playLaser(isCombo = false): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isCombo ? 'sawtooth' : 'sine';
      const startFreq = isCombo ? 980 : 750;
      const endFreq = isCombo ? 180 : 120;
      const duration = isCombo ? 0.22 : 0.15;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      gain.gain.setValueAtTime(isCombo ? 0.2 : 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  /**
   * Suara ledakan / hantaman laser ke boss (low thud rumble)
   */
  public playHit(heavy = false): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(heavy ? 140 : 110, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + (heavy ? 0.35 : 0.2));

      gain.gain.setValueAtTime(heavy ? 0.35 : 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (heavy ? 0.35 : 0.2));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + (heavy ? 0.35 : 0.2));
    } catch {}
  }

  /**
   * Rentetan gabungan laser serentak (combo barrage)
   */
  public playComboBarrage(): void {
    if (this.isMuted) return;
    this.playLaser(true);
    setTimeout(() => this.playHit(true), 120);
  }

  /**
   * Fanfare melodi kemenangan pendek saat Boss Tumbang
   */
  public playVictoryFanfare(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Mayor cerah)
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const noteTime = this.ctx!.currentTime + idx * 0.14;
        const dur = idx === notes.length - 1 ? 0.6 : 0.18;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.25, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + dur);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(noteTime);
        osc.stop(noteTime + dur);
      });
    } catch {}
  }

  public destroy(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

