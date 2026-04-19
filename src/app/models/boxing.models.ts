export type ActionCategory = 'punch' | 'dodge' | 'footwork';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// ── Musical figures ──────────────────────────────────────────────────────────
export interface MusicalFigure {
  id: string;
  nameEs: string;        // Spanish name
  symbol: string;        // Rendered symbol (Unicode / text)
  beats: number;         // Duration in quarter-note beats (negra = 1)
  groupSize: number;     // Required consecutive actions for this rhythmic figure
}

/** All available figures ordered from longest to shortest */
export const MUSICAL_FIGURES: MusicalFigure[] = [
  { id: 'negra',           nameEs: 'Negra',              symbol: '♩',    beats: 1,     groupSize: 1 },
  { id: 'corchea',         nameEs: 'Corchea',            symbol: '♪',    beats: 0.5,   groupSize: 2 },
  { id: 'tresillo-corchea',nameEs: 'Tresillo de Corchea',symbol: '³♪',   beats: 1 / 3, groupSize: 3 },
];

/** Figures allowed per difficulty level */
export const DIFFICULTY_FIGURES: Record<Difficulty, string[]> = {
  beginner:     ['negra'],
  intermediate: ['negra', 'corchea'],
  advanced:     ['negra', 'corchea', 'tresillo-corchea'],
};

// ── Boxing actions ────────────────────────────────────────────────────────────
export interface BoxingAction {
  id: string;
  name: string;
  nameEn: string;
  category: ActionCategory;
  emoji: string;
  color: string;
}

export interface ComboStep {
  action: BoxingAction;
  beat: number;           // Ordinal position in the combo
  figure: MusicalFigure;  // Rhythmic value of this step
  cue?: string;           // Optional execution cue (e.g., Derecha, Izquierda, Atrás)
  directionEmoji?: string; // Directional icon derived from cue + action
}

export interface Combo {
  id: string;
  steps: ComboStep[];
  difficulty: Difficulty;
  bpm: number;
  createdAt: number;
  name?: string;
}

export const BOXING_ACTIONS: BoxingAction[] = [
  { id: 'jab',        name: 'Jab',            nameEn: 'Jab',          category: 'punch',    emoji: '👊', color: '#EF5350' },
  { id: 'cross',      name: 'Directo',        nameEn: 'Cross',        category: 'punch',    emoji: '🥊', color: '#E53935' },
  { id: 'hook-l',     name: 'Crochet Izq.',   nameEn: 'Hook L',       category: 'punch',    emoji: '🥊', color: '#FB8C00' },
  { id: 'hook-r',     name: 'Crochet Der.',   nameEn: 'Hook R',       category: 'punch',    emoji: '🥊', color: '#F57C00' },
  { id: 'uppercut-l', name: 'Uppercut Izq.',  nameEn: 'Uppercut L',   category: 'punch',    emoji: '⬆️', color: '#8E24AA' },
  { id: 'uppercut-r', name: 'Uppercut Der.',  nameEn: 'Uppercut R',   category: 'punch',    emoji: '⬆️', color: '#7B1FA2' },
  { id: 'slip',       name: 'Esquiva',        nameEn: 'Slip',         category: 'dodge',    emoji: '↔️', color: '#1E88E5' },
  { id: 'bob-weave',  name: 'Bob & Weave',    nameEn: 'Bob & Weave',  category: 'dodge',    emoji: '🔄', color: '#039BE5' },
  { id: 'pull-back',  name: 'Pull Back',      nameEn: 'Pull Back',    category: 'dodge',    emoji: '⬅️', color: '#00ACC1' },
  { id: 'step',       name: 'Paso',           nameEn: 'Step',         category: 'footwork', emoji: '👣', color: '#43A047' },
  { id: 'step-around',name: 'Paso Lateral',   nameEn: 'Step Around',  category: 'footwork', emoji: '↩️', color: '#388E3C' },
];

export const COMBO_TRANSITIONS: Record<ActionCategory, ActionCategory[]> = {
  punch:    ['punch', 'dodge', 'footwork'],
  dodge:    ['punch', 'footwork'],
  footwork: ['punch', 'dodge', 'footwork'],
};

export const DIFFICULTY_RANGES: Record<Difficulty, { min: number; max: number }> = {
  beginner:     { min: 2, max: 5  },
  intermediate: { min: 5, max: 9  },
  advanced:     { min: 9, max: 14 },
};
