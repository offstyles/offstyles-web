export type SortOrder = 'Fastest' | 'Slowest' | 'Newest' | 'Oldest';

export interface TimesFilter {
  style?: number;
  page: number;
  limit: number;
  sort?: SortOrder;
  best?: boolean;
  has_replay?: boolean;
  invalidated?: boolean;
  map?: string;
  steamid?: string;
  wr?: boolean;
  recent?: boolean;
}
