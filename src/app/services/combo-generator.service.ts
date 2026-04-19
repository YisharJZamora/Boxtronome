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

type StrikeSide = 'left' | 'right';

interface TacticalState {
  x: number;
  y: number;
  pendingPunchSide: StrikeSide | null;
  consecutiveMovements: number;  // dodge + footwork counter; resets to 0 on punch
}

interface ActionOption {
  action: BoxingAction;
  cue?: string;
  directionEmoji?: string;
  nextState: TacticalState;
}

@Injectable({ providedIn: 'root' })
export class ComboGeneratorService {

  generateCombo(difficulty: Difficulty, bpm: number): Combo {
    const range = DIFFICULTY_RANGES[difficulty];
    const length = this.randomInt(range.min, range.max);
    const steps: ComboStep[] = [];
    const rhythmPattern = this.buildRhythmPattern(difficulty, length);

    // Assumption: combo starts in punching range (X=1) and centered laterally (Y=0).
    // User rule also constrains X to [1,2] and Y to [-1,1].
    let tacticalState: TacticalState = { x: 1, y: 0, pendingPunchSide: null, consecutiveMovements: 0 };

    // Pick a random starting action (prefer punches to start)
    const firstOptions = this.getActionOptions(['punch'], tacticalState);
    const firstChoice = this.pickRandomOption(firstOptions);
    let currentAction = firstChoice.action;
    tacticalState = firstChoice.nextState;
    steps.push({ action: firstChoice.action, cue: firstChoice.cue, directionEmoji: firstChoice.directionEmoji, beat: 1, figure: rhythmPattern[0] });

    for (let i = 1; i < length; i++) {
      const chosen = this.pickNextOption(currentAction.category, tacticalState);

      currentAction = chosen.action;
      tacticalState = chosen.nextState;
      steps.push({ action: chosen.action, cue: chosen.cue, directionEmoji: chosen.directionEmoji, beat: i + 1, figure: rhythmPattern[i] });
    }

    return {
      id: crypto.randomUUID(),
      steps,
      difficulty,
      bpm,
      createdAt: Date.now(),
    };
  }

  private getActionOptions(categories: ActionCategory[], state: TacticalState): ActionOption[] {
    const options: ActionOption[] = [];

    for (const category of categories) {
      if (category === 'punch') {
        options.push(...this.getPunchOptions(state));
      }

      if (category === 'dodge') {
        options.push(...this.getDodgeOptions(state));
      }

      if (category === 'footwork') {
        options.push(...this.getFootworkOptions(state));
      }
    }

    return options;
  }

  private pickNextOption(prevCategory: ActionCategory, state: TacticalState): ActionOption {
    // Rule: after 2 consecutive movements (dodge+footwork) a punch is mandatory.
    if (state.consecutiveMovements >= 2) {
      const punchOptions = this.getPunchOptions(state);
      if (punchOptions.length > 0) {
        return this.pickRandomOption(punchOptions);
      }
      // X=2: must step forward first to reach punching range, then punch.
      const stepForwardOption = this.getStepForwardOption(state);
      if (stepForwardOption) {
        return stepForwardOption;
      }
    }

    const allowedCategories = [...COMBO_TRANSITIONS[prevCategory]];

    // From X=2 punches are not valid; a forward step is required first.
    const filteredCategories = state.x === 2
      ? allowedCategories.filter((cat) => cat !== 'punch')
      : allowedCategories;

    const options = this.getActionOptions(filteredCategories, state);
    return this.pickRandomOption(options);
  }

  private getStepForwardOption(state: TacticalState): ActionOption | null {
    if (state.x <= 1) {
      return null;
    }

    const step = this.getActionById('step');
    return {
      action: step,
      cue: 'Adelante',
      directionEmoji: '⬆️',
      nextState: { ...state, x: state.x - 1 },
    };
  }

  private getPunchOptions(state: TacticalState): ActionOption[] {
    if (state.x !== 1) {
      return [];
    }

    const punchActions = BOXING_ACTIONS.filter((action) => action.category === 'punch');
    const requiredSide = state.pendingPunchSide;

    const filtered = requiredSide
      ? punchActions.filter((action) => this.getPunchSide(action.id) === requiredSide)
      : punchActions;

    return filtered.map((action) => ({
      action,
      cue: this.toSpanishSide(this.getPunchSide(action.id)),
      directionEmoji: action.emoji,
      nextState: {
        ...state,
        pendingPunchSide: null,
        consecutiveMovements: 0,
      },
    }));
  }

  private getDodgeOptions(state: TacticalState): ActionOption[] {
    // Can only dodge when inside punching range (x=1). Out of range, step forward first.
    if (state.x !== 1) {
      return [];
    }
    const slip     = this.getActionById('slip');
    const bobWeave = this.getActionById('bob-weave');
    const pullBack = this.getActionById('pull-back');
    const cm = state.consecutiveMovements + 1;

    return [
      { action: slip,     cue: 'Izquierda', directionEmoji: '⬅️', nextState: { ...state, pendingPunchSide: 'left'  as StrikeSide, consecutiveMovements: cm } },
      { action: slip,     cue: 'Derecha',   directionEmoji: '➡️', nextState: { ...state, pendingPunchSide: 'right' as StrikeSide, consecutiveMovements: cm } },
      { action: bobWeave, cue: 'Izquierda', directionEmoji: '⬅️', nextState: { ...state, pendingPunchSide: 'left'  as StrikeSide, consecutiveMovements: cm } },
      { action: bobWeave, cue: 'Derecha',   directionEmoji: '➡️', nextState: { ...state, pendingPunchSide: 'right' as StrikeSide, consecutiveMovements: cm } },
      { action: pullBack, cue: 'Atrás',     directionEmoji: '⬇️', nextState: { ...state, consecutiveMovements: cm } },
    ];
  }

  private getFootworkOptions(state: TacticalState): ActionOption[] {
    const step = this.getActionById('step');
    const stepAround = this.getActionById('step-around');
    const stepInOut = BOXING_ACTIONS.find((action) => action.id === 'step-in-out');
    const options: ActionOption[] = [];

    // X bounds: [1,2]
    // Step-back is only available when there are no pending movements yet,
    // because at X=2 a punch requires a step-forward first, which would
    // result in 3 consecutive movements if cm is already ≥ 1.
    if (state.x < 2 && state.consecutiveMovements === 0) {
      options.push({
        action: step,
        cue: 'Atrás',
        directionEmoji: '⬇️',
        nextState: { ...state, x: state.x + 1 },
      });
    }

    if (state.x > 1) {
      options.push({
        action: step,
        cue: 'Adelante',
        directionEmoji: '⬆️',
        nextState: { ...state, x: state.x - 1 },
      });
    }

    // Y bounds: [-1,1]
    // Step-around only makes sense when inside punching range (x=1).
    if (state.x === 1 && state.y < 1) {
      options.push({
        action: stepAround,
        cue: 'Derecha',
        directionEmoji: '➡️',
        nextState: { ...state, y: state.y + 1, pendingPunchSide: 'right' as StrikeSide },
      });
    }

    if (state.x === 1 && state.y > -1) {
      options.push({
        action: stepAround,
        cue: 'Izquierda',
        directionEmoji: '⬅️',
        nextState: { ...state, y: state.y - 1, pendingPunchSide: 'left' as StrikeSide },
      });
    }

    // Optional neutral in-out rhythm move (if this action exists in the catalog).
    if (stepInOut) {
      options.push({
        action: stepInOut,
        cue: state.x === 1 ? 'Entrada/Salida' : 'Salida/Entrada',
        directionEmoji: '↕️',
        nextState: { ...state },
      });
    }

    return options.map((opt) => ({
      ...opt,
      nextState: { ...opt.nextState, consecutiveMovements: state.consecutiveMovements + 1 },
    }));
  }

  private getPunchSide(actionId: string): StrikeSide {
    if (['cross', 'hook-r', 'uppercut-r'].includes(actionId)) {
      return 'right';
    }

    // Jab + left hooks/uppercuts are treated as left-side strikes.
    return 'left';
  }

  private toSpanishSide(side: StrikeSide): string {
    return side === 'left' ? 'Izquierda' : 'Derecha';
  }

  private getActionById(id: string): BoxingAction {
    return BOXING_ACTIONS.find((action) => action.id === id)!;
  }

  private pickRandomOption(options: ActionOption[]): ActionOption {
    return options[this.randomInt(0, options.length - 1)];
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


  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
