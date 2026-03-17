// Moderation Action Types
export enum ModerationActionType {
  // Validation / Hidden status (mainly for records)
  Invalidate = "Invalidate",
  Revalidate = "Revalidate",
  
  // Add/Change a note on the action (does NOT change validation or ban status)
  Note = "Note",
  
  // Ban Status (mainly for profile related things)
  Ban = "Ban",
  Unban = "Unban"
}

export interface ModeratorInfo {
  steam_id: string;
  username: string;
  avatar_url?: string;
}

// Individual moderation action
export interface ModerationAction {
  mod_steam_id: string;
  notes?: string;
  timestamp: number; // Unix timestamp in milliseconds
  action: ModerationActionType;
}

export interface ModerationLogAction {
  timestamp: number; // Unix timestamp in milliseconds
  action: ModerationActionType;
  notes?: string;
  mod: ModeratorInfo;
}

// Moderation record (contains all actions for a target)
export interface ModerationRecord {
  _id?: string; // ObjectId as string
  actions: ModerationAction[];
}

export interface ModerationLogResponse {
  _id?: string; // ObjectId as string
  actions: ModerationLogAction[];
}

// Target types for moderation
export enum ModerationTarget {
  Player = "Player",
  Record = "Record"
}

// Form data for posting moderation actions
export interface ModerationPostData {
  reason: string;
  action: ModerationActionType;
}

// User permissions bitflags
export class UserPermissions {
  static readonly INVALIDATE_TIMES = 1 << 0;
  static readonly BAN_PLAYERS = 1 << 1;
  static readonly SERVER_OWNER_INVALIDATE_TIMES = 1 << 2;
  static readonly UNDO_MOD_ACTION = 1 << 15;
  static readonly BYPASS_RATELIMITS = 1 << 29;
  static readonly CREATE_KEY = 1 << 30;
  static readonly MANAGE_KEYS = 1 << 31;
  
  // Permission groups
  static readonly MODERATOR = UserPermissions.INVALIDATE_TIMES | UserPermissions.BAN_PLAYERS;
  static readonly ADMIN = UserPermissions.MODERATOR | UserPermissions.UNDO_MOD_ACTION | UserPermissions.CREATE_KEY;
  // OWNER would have all permissions
  
  constructor(private value: number) {}
  
  contains(permission: number): boolean {
    return (this.value & permission) === permission;
  }
  
  isModerator(): boolean {
    return this.contains(UserPermissions.MODERATOR);
  }
  
  isAdmin(): boolean {
    return this.contains(UserPermissions.ADMIN);
  }
}

// Standard API error response
export interface JsonError {
  error: string;
  message?: string;
}

// API response wrapper
export type ApiResult<T> = T | JsonError;

// Check if response is an error
export function isApiError<T>(response: ApiResult<T>): response is JsonError {
  return typeof response === 'object' && response !== null && 'error' in response;
}

// Moderation target filter for recent logs
export enum ModerationTargetFilter {
  Player = "Player",
  Record = "Record"
}

// Recent moderation action for general logs
export interface RecentModAction {
  timestamp: number; // Unix timestamp in milliseconds
  action: ModerationActionType;
  moderator_name: string;
  moderator_steam_id: string;
  moderator_avatar_url?: string; // Optional avatar URL for the moderator
  target_type: ModerationTarget;
  target_name: string;
  target_id: string;
  notes?: string;
}