import { Injectable } from '@angular/core';
import {
  BOXING_ACTIONS,
  BoxingAction,
  Combo,
  ComboStep,
  COMBO_TRANSITIONS,
  Difficulty,
  DIFFICULTY_RANGES,
  ActionCategory,
  MUSICAL_FIGURES,
  DIFFICULTY_FIGURES,
  MusicalFigure,
} from '../models/boxing.models';

interface RhythmBlock {
  figure: MusicalFigure;
  groupSize: number;
  weight: number;
}

@Injectable({ providedIn: 'root' })
export class ComboGeneratorService {

  generateCombo(difficulty: Difficulty, bpm: number): Combo {
    const range = DIFFICULTY_RANGES[difficulty];
    const length = this.randomInt(range.min, range.max);
    const steps: ComboStep[] = [];
    const rhythmPattern = this.buildRhythmPattern(difficulty, length);

    // Pick a random starting action (prefer punches to start)
    let currentAction = this.randomFromCategory('punch');
    steps.push({ action: currentAction, beat: 1, figure: rhythmPattern[0] });

    for (let i = 1; i < length; i++) {
      const allowed = COMBO_TRANSITIONS[currentAction.category];
      const nextCategory = allowed[this.randomInt(0, allowed.length - 1)];
      currentAction = this.randomFromCategory(nextCategory);
      steps.push({ action: currentAction, beat: i + 1, figure: rhythmPattern[i] });
    }

    return {
      id: crypto.randomUUID(),
      steps,
      difficulty,
      bpm,
      createdAt: Date.now(),
    };
  }

  private buildRhythmPattern(difficulty: Difficulty, length: number): MusicalFigure[] {
    const allowedFigureIds = DIFFICULTY_FIGURES[difficulty];
    const blocks = MUSICAL_FIGURES
      .filter((figure) => allowedFigureIds.includes(figure.id))
      .map((figure) => ({
        figure,
        groupSize: figure.groupSize,
        weight: this.getBlockWeight(difficulty, figure.groupSize),
      } satisfies RhythmBlock));

    const pattern: MusicalFigure[] = [];
    let remaining = length;
    let previousFigureId: string | null = null;

    while (remaining > 0) {
      const fittingBlocks = blocks.filter((block) =>
        block.groupSize <= remaining
        && this.canFillRemaining(remaining - block.groupSize, blocks)
      );

      const preferredBlocks = fittingBlocks.filter((block) => block.figure.id !== previousFigureId);
      const candidateBlocks = preferredBlocks.length > 0 ? preferredBlocks : fittingBlocks;
      const chosenBlock = this.pickWeightedBlock(candidateBlocks);

      for (let i = 0; i < chosenBlock.groupSize; i++) {
        pattern.push(chosenBlock.figure);
      }

      remaining -= chosenBlock.groupSize;
      previousFigureId = chosenBlock.figure.id;
    }

    return pattern;
  }

  private canFillRemaining(remaining: number, blocks: RhythmBlock[], memo = new Map<number, boolean>()): boolean {
    if (remaining === 0) {
      return true;
    }

    if (memo.has(remaining)) {
      return memo.get(remaining)!;
    }

    const canFill = blocks.some((block) =>
      block.groupSize <= remaining
      && this.canFillRemaining(remaining - block.groupSize, blocks, memo)
    );

    memo.set(remaining, canFill);
    return canFill;
  }

  private pickWeightedBlock(blocks: RhythmBlock[]): RhythmBlock {
    const totalWeight = blocks.reduce((sum, block) => sum + block.weight, 0);
    let threshold = Math.random() * totalWeight;

    for (const block of blocks) {
      threshold -= block.weight;
      if (threshold <= 0) {
        return block;
      }
    }

    return blocks[blocks.length - 1];
  }

  private getBlockWeight(difficulty: Difficulty, groupSize: number): number {
    const weights: Record<Difficulty, Record<number, number>> = {
      beginner: {
        1: 8,
        2: 2,
        3: 1,
      },
      intermediate: {
        1: 5,
        2: 4,
        3: 2,
      },
      advanced: {
        1: 3,
        2: 4,
        3: 4,
      },
    };

    return weights[difficulty][groupSize] ?? 1;
  }

  private randomFromCategory(category: ActionCategory): BoxingAction {
    const pool = BOXING_ACTIONS.filter(a => a.category === category);
    return pool[this.randomInt(0, pool.length - 1)];
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
