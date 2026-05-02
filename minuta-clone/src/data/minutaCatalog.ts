import { fluxo, type Flow, type Option } from './flow';

export interface MinutaSelection {
  stepKey: string;
  question: string;
  optionText: string;
  snippet: string;
  nextStep: string;
}

export interface MinutaCatalogEntry {
  id: string;
  selections: MinutaSelection[];
}

export interface MinutaPathStep {
  step: string;
  optionText: string;
}

const buildEntryId = (trail: MinutaSelection[]): string =>
  trail
    .map(selection => `${selection.stepKey}:${selection.optionText}`)
    .join(' | ');

const collectMinutas = (
  flow: Flow,
  stepKey: string,
  trail: MinutaSelection[] = []
): MinutaCatalogEntry[] => {
  const question = flow[stepKey];

  if (!question) {
    return [];
  }

  return question.opcoes.flatMap((option: Option) => {
    const nextTrail = [
      ...trail,
      {
        stepKey,
        question: question.pergunta,
        optionText: option.texto,
        snippet: option.snippet,
        nextStep: option.proximo
      }
    ];

    if (option.proximo === 'final') {
      return [{ id: buildEntryId(nextTrail), selections: nextTrail }];
    }

    return collectMinutas(flow, option.proximo, nextTrail);
  });
};

export const minutaCatalog = collectMinutas(fluxo, 'inicio');

export const findMinutaByPath = (path: MinutaPathStep[]): MinutaCatalogEntry | undefined =>
  minutaCatalog.find(entry =>
    entry.selections.length === path.length &&
    entry.selections.every((selection, index) => {
      const currentStep = path[index];
      return (
        selection.stepKey === currentStep.step &&
        selection.optionText === currentStep.optionText
      );
    })
  );
