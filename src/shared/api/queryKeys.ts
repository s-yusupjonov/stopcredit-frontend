import type { CardsFilters, CreditsFilters } from './types';

export const queryKeys = {
  credits: {
    all: ['credits'] as const,
    list: (filters: CreditsFilters) => ['credits', 'list', filters] as const,
    detail: (id: number) => ['credits', 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
  },
  cards: {
    all: ['cards'] as const,
    list: (filters: CardsFilters) => ['cards', 'list', filters] as const,
    detail: (id: number) => ['cards', 'detail', id] as const,
  },
  executors: {
    all: ['executors'] as const,
  },
};
