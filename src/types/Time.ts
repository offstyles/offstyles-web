export interface RecordHeaders {
  hostname: string;
  key_id: string;
}

export interface Time {
  _id: string | null;
  map: string;
  steamid: string;
  name: string;
  time: number;
  sync: number;
  strafes: number;
  jumps: number;
  date: number;
  replay_ref?: string | null;
  style: number;
  is_invalid: boolean;
  is_banned: boolean;
  invalid_ref?: string | null;
  server?: RecordHeaders | null;
  rank?: number;
  wr_time?: number;
}
