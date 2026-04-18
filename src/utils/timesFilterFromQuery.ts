import type { TimesFilter, SortOrder } from '@/types/TimesFilter';
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

const fromQuery = function(
  query: Record<string, string>,
  defaults: FilterDefaults,
  canSeeInvalidated: boolean = false,
): TimesFilter {
  const styleRaw = query.style ? parseInt(query.style) : defaults.style;
  const style = styleRaw === Style.all || Number.isNaN(styleRaw) ? undefined : styleRaw;

  return {
    style,
    page: Math.max(1, query.page ? parseInt(query.page) : 1),
    limit: defaults.limit,
    sort: parseSort(query.sort, defaults.sort),
    best: query.best !== undefined ? query.best === 'true' : defaults.best,
    has_replay: query.has_replay === 'true' ? true : undefined,
    invalidated: canSeeInvalidated && query.invalidated !== undefined
      ? query.invalidated === 'true'
      : undefined,
  };
};

export default { fromQuery };
