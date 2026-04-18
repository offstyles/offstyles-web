import type { TimesFilter, SortOrder, TimesScope } from '@/types/TimesFilter';
import { Style } from '@/types/Style';

export interface FilterDefaults {
  style: number;
  sort: SortOrder;
  best: boolean;
  limit: number;
}

const VALID_SORTS: readonly SortOrder[] = ['Fastest', 'Slowest', 'Newest', 'Oldest'];

const parseSort = function(raw: string | undefined, fallback: SortOrder): SortOrder {
  return VALID_SORTS.includes(raw as SortOrder) ? (raw as SortOrder) : fallback;
};

const parsePage = function(raw: string | undefined): number {
  const n = raw ? parseInt(raw) : 1;
  return Number.isFinite(n) && n >= 1 ? n : 1;
};

const parseStyle = function(raw: string | undefined, fallback: number): number | undefined {
  const n = raw ? parseInt(raw) : fallback;
  return n === Style.all || Number.isNaN(n) ? undefined : n;
};

interface BaseArgs {
  query: Record<string, string>;
  defaults: FilterDefaults;
  canSeeInvalidated?: boolean;
}

function baseFilter({ query, defaults, canSeeInvalidated = false }: BaseArgs): Omit<TimesFilter, 'scope'> {
  return {
    style: parseStyle(query.style, defaults.style),
    page: parsePage(query.page),
    limit: defaults.limit,
    sort: parseSort(query.sort, defaults.sort),
    best: query.best !== undefined ? query.best === 'true' : defaults.best,
    has_replay: query.has_replay === 'true' ? true : undefined,
    // Non-moderators never send invalidated to the server even if it leaks into a shared URL.
    invalidated: canSeeInvalidated && query.invalidated !== undefined
      ? query.invalidated === 'true'
      : undefined,
  };
}

const forMap = function(
  query: Record<string, string>,
  mapName: string,
  defaults: FilterDefaults,
  canSeeInvalidated: boolean,
): TimesFilter {
  return { ...baseFilter({ query, defaults, canSeeInvalidated }), scope: { kind: 'map', map: mapName } };
};

const forPlayer = function(
  query: Record<string, string>,
  steamid: string,
  defaults: FilterDefaults,
  canSeeInvalidated: boolean,
): TimesFilter {
  return { ...baseFilter({ query, defaults, canSeeInvalidated }), scope: { kind: 'player', steamid } };
};

const forGlobals = function(
  query: Record<string, string>,
  defaults: FilterDefaults,
  scope: Omit<TimesScope & { kind: 'globals' }, 'kind'> = { recent: true, wr: true },
): TimesFilter {
  const wr = query.wr !== undefined ? query.wr === 'true' : scope.wr;
  return {
    ...baseFilter({ query, defaults }),
    scope: { kind: 'globals', recent: scope.recent, wr },
  };
};

export default { forMap, forPlayer, forGlobals };
