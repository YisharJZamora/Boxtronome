import { Injectable } from '@angular/core';
import { Combo } from '../models/boxing.models';

const FAVORITES_KEY = 'boxtronome_favorites';

@Injectable({ providedIn: 'root' })
export class StorageService {

  getFavorites(): Combo[] {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveFavorite(combo: Combo): void {
    const favorites = this.getFavorites();
    if (!favorites.find(f => f.id === combo.id)) {
      favorites.unshift(combo);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }

  removeFavorite(id: string): void {
    const favorites = this.getFavorites().filter(f => f.id !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }

  isFavorite(id: string): boolean {
    return this.getFavorites().some(f => f.id === id);
  }
}

