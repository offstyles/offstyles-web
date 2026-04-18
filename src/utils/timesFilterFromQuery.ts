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

  const pageRaw = query.page ? parseInt(query.page) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

  return {
    style,
    page,
    limit: defaults.limit,
    sort: parseSort(query.sort, defaults.sort),
    best: query.best !== undefined ? query.best === 'true' : defaults.best,
    has_replay: query.has_replay === 'true' ? true : undefined,
    // Non-moderators never send invalidated to the server even if it leaks into a shared URL.
    invalidated: canSeeInvalidated && query.invalidated !== undefined
      ? query.invalidated === 'true'
      : undefined,
  };
};

export default { fromQuery };
