export interface User {
  _id: string;
  steam_id: string;
  username: string;
  avatar_url: string;
  permissions: number;
  created_at: number;
  last_login: number;
  is_banned?: boolean;
  ban_ref?: string | null;
}