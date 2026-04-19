import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx: AudioContext | null = null;
  private metronomeInterval: ReturnType<typeof setInterval> | null = null;
  private isMetronomeRunning = false;

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  // Play a tone: frequency, duration ms, type
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainValue = 0.4,
    when = 0
  ): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(gainValue, ctx.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + duration / 1000);
    osc.start(ctx.currentTime + when);
    osc.stop(ctx.currentTime + when + duration / 1000);
  }

  // Each action has a distinct sound
  playActionSound(actionId: string): void {
    const sounds: Record<string, () => void> = {
      'jab':          () => this.playTone(880, 80,  'square', 0.3),
      'cross':        () => this.playTone(660, 120, 'square', 0.5),
      'hook-l':       () => this.playTone(440, 150, 'sawtooth', 0.4),
      'hook-r':       () => this.playTone(500, 150, 'sawtooth', 0.4),
      'uppercut-l':   () => this.playTone(300, 180, 'triangle', 0.5),
      'uppercut-r':   () => this.playTone(350, 180, 'triangle', 0.5),
      'slip':         () => this.playTone(1200, 60, 'sine', 0.2),
      'bob-weave':    () => { this.playTone(1000, 60, 'sine', 0.2, 0); this.playTone(800, 60, 'sine', 0.2, 0.07); },
      'pull-back':    () => this.playTone(700, 80,  'sine', 0.2),
      'step':         () => this.playTone(200, 100, 'sine', 0.3),
      'step-around':  () => { this.playTone(200, 80, 'sine', 0.3, 0); this.playTone(250, 80, 'sine', 0.3, 0.08); },
    };
    sounds[actionId]?.();
  }

  async playCombo(
    steps: { action: { id: string }; figure?: { beats: number } }[],
    bpm: number,
    onStep?: (index: number) => void
  ): Promise<void> {
    // Quarter-note (negra) duration in ms at the given BPM
    const quarterMs = (60 / bpm) * 1000;
    for (let i = 0; i < steps.length; i++) {
      onStep?.(i);
      this.playActionSound(steps[i].action.id);
      // Use the figure's beat multiplier; fall back to 1 (negra) if missing
      const beats = steps[i].figure?.beats ?? 1;
      await this.delay(quarterMs * beats);
    }
    onStep?.(-1);
  }

  startMetronome(bpm: number): void {
    this.stopMetronome();
    this.isMetronomeRunning = true;
    const interval = (60 / bpm) * 1000;
    this.playMetronomeTick(true);
    let beat = 1;
    this.metronomeInterval = setInterval(() => {
      beat++;
      this.playMetronomeTick(beat % 4 === 1);
    }, interval);
  }

  stopMetronome(): void {
    if (this.metronomeInterval !== null) {
      clearInterval(this.metronomeInterval);
      this.metronomeInterval = null;
    }
    this.isMetronomeRunning = false;
  }

  get metronomeRunning(): boolean {
    return this.isMetronomeRunning;
  }

  private playMetronomeTick(accent: boolean): void {
    this.playTone(accent ? 1200 : 800, accent ? 60 : 40, 'square', accent ? 0.5 : 0.3);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

