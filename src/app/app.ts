import { Component, signal, computed, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';

import { Combo, Difficulty } from './models/boxing.models';
import { ComboGeneratorService } from './services/combo-generator.service';
import { AudioService } from './services/audio.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule, NgClass, DatePipe,
    MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule,
    MatSliderModule, MatSelectModule, MatFormFieldModule, MatChipsModule, MatTooltipModule,
    MatBadgeModule, MatDividerModule, MatSnackBarModule, MatTabsModule, MatListModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  private generator = inject(ComboGeneratorService);
  private audio = inject(AudioService);
  private storage = inject(StorageService);
  private snack = inject(MatSnackBar);

  difficulty = signal<Difficulty>('beginner');
  bpm = signal(60);
  currentCombo = signal<Combo | null>(null);
  activeStepIndex = signal(-1);
  isPlaying = signal(false);
  favorites = signal<Combo[]>(this.storage.getFavorites());
  selectedFavorite = signal<Combo | null>(null);

  isFavorite = computed(() => {
    const c = this.currentCombo();
    return c ? this.storage.isFavorite(c.id) : false;
  });

  metronomeRunning = signal(false);

  readonly difficulties: { value: Difficulty; label: string; icon: string }[] = [
    { value: 'beginner',     label: 'Principiante', icon: 'school' },
    { value: 'intermediate', label: 'Intermedio',   icon: 'fitness_center' },
    { value: 'advanced',     label: 'Avanzado',     icon: 'military_tech' },
  ];

  generateCombo(): void {
    const combo = this.generator.generateCombo(this.difficulty(), this.bpm());
    this.currentCombo.set(combo);
    this.activeStepIndex.set(-1);
    this.selectedFavorite.set(null);
  }

  async playCombo(combo: Combo): Promise<void> {
    if (this.isPlaying()) return;
    this.isPlaying.set(true);
    await this.audio.playCombo(combo.steps, combo.bpm, (idx) => this.activeStepIndex.set(idx));
    this.isPlaying.set(false);
  }

  toggleMetronome(): void {
    if (this.audio.metronomeRunning) {
      this.audio.stopMetronome();
      this.metronomeRunning.set(false);
    } else {
      this.audio.startMetronome(this.bpm());
      this.metronomeRunning.set(true);
    }
  }

  saveFavorite(): void {
    const c = this.currentCombo();
    if (!c) return;
    this.storage.saveFavorite(c);
    this.favorites.set(this.storage.getFavorites());
    this.snack.open('¡Combo guardado en favoritos!', '', { duration: 2000 });
  }

  removeFavorite(id: string): void {
    this.storage.removeFavorite(id);
    this.favorites.set(this.storage.getFavorites());
    if (this.selectedFavorite()?.id === id) this.selectedFavorite.set(null);
    this.snack.open('Combo eliminado', '', { duration: 2000 });
  }

  loadFavorite(combo: Combo): void {
    this.selectedFavorite.set(combo);
    this.currentCombo.set(combo);
    this.activeStepIndex.set(-1);
  }

  getDifficultyLabel(d: Difficulty): string {
    return this.difficulties.find(x => x.value === d)?.label ?? d;
  }

  beatDuration(bpm: number): string {
    return ((60 / bpm) * 1000).toFixed(0) + ' ms';
  }

  difficultyHint(d: Difficulty): string {
    const hints: Record<Difficulty, string> = {
      beginner:     '2 – 5 acciones',
      intermediate: '5 – 9 acciones',
      advanced:     '9 – 14 acciones',
    };
    return hints[d];
  }

  ngOnDestroy(): void {
    this.audio.stopMetronome();
  }
}
