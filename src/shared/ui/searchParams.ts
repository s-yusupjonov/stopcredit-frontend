/** Helpers that read list filters from the URL defensively: a hand-edited or stale link never reaches the API as garbage. */

export function readEnum<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
): T | undefined {
  const value = params.get(key);
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

export function readPage(params: URLSearchParams): number {
  const page = Number.parseInt(params.get('page') ?? '', 10);
  return Number.isFinite(page) && page > 0 ? page : 0;
}

export function readPositiveInt(params: URLSearchParams, key: string): number | undefined {
  const value = Number.parseInt(params.get(key) ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export function readIsoDate(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key);
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

export function readText(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key)?.trim();
  return value ? value : undefined;
}
