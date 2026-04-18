import { ComboGeneratorService } from './combo-generator.service';
import { DIFFICULTY_RANGES, Difficulty } from '../models/boxing.models';

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
});

