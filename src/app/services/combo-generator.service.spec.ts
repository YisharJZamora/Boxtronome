import { ComboGeneratorService } from './combo-generator.service';
import { DIFFICULTY_RANGES, Difficulty } from '../models/boxing.models';

type StrikeSide = 'left' | 'right';

describe('ComboGeneratorService', () => {
  const service = new ComboGeneratorService();
  const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

  it('should generate combos within the configured action ranges', () => {
    for (const difficulty of difficulties) {
      for (let i = 0; i < 25; i++) {
        const combo = service.generateCombo(difficulty, 90);
        const range = DIFFICULTY_RANGES[difficulty];

        expect(combo.steps.length).toBeGreaterThanOrEqual(range.min);
        expect(combo.steps.length).toBeLessThanOrEqual(range.max);
      }
    }
  });

  it('should keep grouped figures in complete consecutive blocks', () => {
    for (const difficulty of difficulties) {
      for (let i = 0; i < 50; i++) {
        const combo = service.generateCombo(difficulty, 90);
        let index = 0;

        while (index < combo.steps.length) {
          const currentFigure = combo.steps[index].figure;
          let runLength = 1;

          while (
            index + runLength < combo.steps.length
            && combo.steps[index + runLength].figure.id === currentFigure.id
          ) {
            runLength++;
          }

          if (currentFigure.groupSize > 1) {
            expect(runLength).toBe(currentFigure.groupSize);
          }

          index += runLength;
        }
      }
    }
  });

  it('should generate corcheas in pairs and triplets in groups of three', () => {
    for (const difficulty of difficulties) {
      for (let i = 0; i < 50; i++) {
        const combo = service.generateCombo(difficulty, 90);
        let index = 0;

        while (index < combo.steps.length) {
          const figure = combo.steps[index].figure;
          let runLength = 1;

          while (
            index + runLength < combo.steps.length
            && combo.steps[index + runLength].figure.id === figure.id
          ) {
            runLength++;
          }

          if (figure.id === 'corchea') {
            expect(runLength).toBe(2);
          }

          if (figure.id.startsWith('tresillo')) {
            expect(runLength).toBe(3);
          }

          index += runLength;
        }
      }
    }
  });

  it('should respect tactical X/Y limits and side constraints for punches', () => {
    for (const difficulty of difficulties) {
      for (let i = 0; i < 100; i++) {
        const combo = service.generateCombo(difficulty, 90);

        let x = 1;
        let y = 0;
        let pendingPunchSide: StrikeSide | null = null;
        let consecutiveMovements = 0;

        for (const step of combo.steps) {
          if (step.action.category === 'punch') {
            // Must be at striking range
            expect(x).toBe(1);

            // Must match the required side if one was pending
            if (pendingPunchSide) {
              expect(getPunchSide(step.action.id)).toBe(pendingPunchSide);
            }

            pendingPunchSide = null;
            consecutiveMovements = 0;
          } else {
            // No more than 2 movements in a row
            consecutiveMovements++;
            expect(consecutiveMovements).toBeLessThanOrEqual(2);
          }

          if (step.action.id === 'step') {
            if (step.cue === 'Atrás')    x += 1;
            if (step.cue === 'Adelante') x -= 1;
          }

          if (step.action.id === 'step-around') {
            if (step.cue === 'Derecha')   { y += 1; pendingPunchSide = 'right'; }
            if (step.cue === 'Izquierda') { y -= 1; pendingPunchSide = 'left'; }
          }

          if (step.action.id === 'slip' || step.action.id === 'bob-weave') {
            if (step.cue === 'Derecha')   pendingPunchSide = 'right';
            if (step.cue === 'Izquierda') pendingPunchSide = 'left';
          }

          expect(x).toBeGreaterThanOrEqual(1);
          expect(x).toBeLessThanOrEqual(2);
          expect(y).toBeGreaterThanOrEqual(-1);
          expect(y).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});

function getPunchSide(actionId: string): StrikeSide {
  if (['cross', 'hook-r', 'uppercut-r'].includes(actionId)) {
    return 'right';
  }

  return 'left';
}

