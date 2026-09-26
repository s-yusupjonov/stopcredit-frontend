import type { CreditsFilters } from './types';

export const queryKeys = {
  credits: {
    all: ['credits'] as const,
    list: (filters: CreditsFilters) => ['credits', 'list', filters] as const,
    detail: (id: number) => ['credits', 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
  },
};
