export type SortOrder = 'Fastest' | 'Slowest' | 'Newest' | 'Oldest';

export type TimesScope =
  | { kind: 'map'; map: string }
  | { kind: 'player'; steamid: string }
  | { kind: 'globals'; wr?: boolean; recent?: boolean };

export interface TimesFilter {
  scope: TimesScope;
  style?: number;
  page: number;
  limit: number;
  sort?: SortOrder;
  best?: boolean;
  has_replay?: boolean;
  invalidated?: boolean;
}
