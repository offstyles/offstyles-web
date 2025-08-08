import { Style } from '@/types/Style';
import Api from './api';
import type { Time } from '@/types/Time';
import type { User } from '@/types/User';
import type { RecentModAction, ModerationTargetFilter } from '@/types/moderation';

// Add new interfaces based on the API spec
export interface RankAwareRecord extends Time {
  rank: number;
}

export interface WRAwareRecord extends Time {
  wr_time: number;
}

export interface ReturnStyle {
  name: string;
  s_id: number;
}

export interface JsonError {
  code: number;
  reason: string;
}

export interface ServerActivityDocument {
  server: string;
  active: boolean;
  ips: string[];
}

export interface KeyReturnJson {
  key: string;
}

export interface ServerKeyInfo {
  server: string;
  key: string;
  permissions: number;
}

class OffstylesApi extends Api {
  static offstylesApiUrl = import.meta.env.DEV ? '/api' : 'https://offstyles.tommyy.dev/api';

  // Fixed method signature to require style parameter
  static async getTimesByMap(mapName: string, style: number = 190, steamid?: string, limit: number = 50, page: number = 1): Promise<RankAwareRecord[]> {
    const params = new URLSearchParams({
      map: mapName,
      style: style.toString(),
      limit: limit.toString(),
      page: page.toString()
    });
    
    if (steamid) {
      params.append('steamid', steamid);
    }

    this.url = `${this.offstylesApiUrl}/map?${params.toString()}`;
    return await this.fetchFromUrl();
  }

  static async getTimesByPlayer(steamID: string, map?: string, style: number = 190, limit: number = 50, page: number = 1, best: boolean = false): Promise<WRAwareRecord[]> {
    const params = new URLSearchParams({
      steamid: steamID,
      limit: limit.toString(),
      page: page.toString(),
      best: best.toString()
    });

    if (map) {
      params.append('map', map);
    }
    
    if (style !== undefined) {
      params.append('style', style.toString());
    }

    this.url = `${this.offstylesApiUrl}/times?${params.toString()}`;
    return await this.fetchFromUrl();
  }

  static async getRecentTimes(style: number = Style.normal, limit: number = 15, page: number = 1, wr: boolean = true): Promise<WRAwareRecord[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      wr: wr.toString()
    });

    if (style !== undefined) {
      params.append('style', style.toString());
    }

    this.url = `${this.offstylesApiUrl}/recent?${params.toString()}`;
    return await this.fetchFromUrl();
  }

  // New methods based on the API spec
  static async getMapsForAutoComplete(text: string): Promise<string[]> {
    const params = new URLSearchParams({
      text: text
    });

    this.url = `${this.offstylesApiUrl}/autocomplete_maps?${params.toString()}`;
    return await this.fetchFromUrl();
  }

  static async getPlayersForAutoComplete(text: string): Promise<[string, string][]> {
    const params = new URLSearchParams({
      text: text
    });

    this.url = `${this.offstylesApiUrl}/autocomplete_players?${params.toString()}`;
    return await this.fetchFromUrl();
  }

  static async getSingleTime(id: string): Promise<WRAwareRecord> {
    const params = new URLSearchParams({
      id: id
    });

    this.url = `${this.offstylesApiUrl}/time?${params.toString()}`;
    return await this.fetchFromUrl();
  }

  static async getStyles(): Promise<ReturnStyle[]> {
    this.url = `${this.offstylesApiUrl}/styles`;
    return await this.fetchFromUrl();
  }

  static async downloadReplay(id: string): Promise<Response> {
    const params = new URLSearchParams({
      id: id
    });

    const response = await fetch(`${this.offstylesApiUrl}/replay?${params.toString()}`, {
      credentials: 'include' // Include cookies for session authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error: JsonError = JSON.parse(errorText);
        throw new Error(`${error.code}: ${error.reason}`);
      } catch {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }

    return response;
  }

  // Moderation methods (require authentication)
  static async moderatePlayer(steamId: string, action: 'ban' | 'unban', reason: string): Promise<void> {
    const params = new URLSearchParams({
      id: steamId,
      action: action
    });

    const response = await fetch(`${this.offstylesApiUrl}/moderate_player?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: reason,
      credentials: 'include' // Include cookies for session authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error: JsonError = JSON.parse(errorText);
        throw new Error(`${error.code}: ${error.reason}`);
      } catch {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }
  }

  static async moderateRecord(recordId: string, action: 'invalidate' | 'revalidate', reason: string): Promise<void> {
    return this.moderateRecords([recordId], action, reason);
  }

    // Bulk moderation method for multiple records
  static async moderateRecords(recordIds: string[], action: 'invalidate' | 'revalidate', reason: string): Promise<void> {
    const params = new URLSearchParams({
      action: action,
      ids: recordIds.join(',') // Comma-separated values for the ids parameter
    });

    const response = await fetch(`${this.offstylesApiUrl}/moderate_record?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: reason,
      credentials: 'include' // Include cookies for session authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error: JsonError = JSON.parse(errorText);
        throw new Error(`${error.code}: ${error.reason}`);
      } catch {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }
  }

  // Get user profile data
  static async getUserProfile(steamId: string): Promise<User> {
    const params = new URLSearchParams({
      steamid: steamId
    });

    const response = await fetch(`${this.offstylesApiUrl}/profile?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error: JsonError = JSON.parse(errorText);
        throw new Error(`${error.code}: ${error.reason}`);
      } catch {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }

    return await response.json();
  }

  // Authentication methods
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.offstylesApiUrl}/profile`, {
        credentials: 'include' // Include cookies for session authentication
      });

      if (response.ok) {
        return await response.json();
      } else {
        return null; // Not authenticated or user not found
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  static getLoginUrl(): string {
    return `${this.offstylesApiUrl}/steam`;
  }

  static getLogoutUrl(): string {
    return `${this.offstylesApiUrl}/logout`;
  }

  // Get moderation logs
  static async getModerationLogs(id: string): Promise<any> {
    const params = new URLSearchParams({
      id: id
    });

    const response = await fetch(`${this.offstylesApiUrl}/mod_logs?${params.toString()}`, {
      credentials: 'include' // Include cookies for session authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error: JsonError = JSON.parse(errorText);
        throw new Error(`${error.code}: ${error.reason}`);
      } catch {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }

    return await response.json();
  }

  // Server management methods
  static async getServers(): Promise<ServerActivityDocument[]> {
    this.url = `${this.offstylesApiUrl}/servers`;
    const result = await this.fetchFromUrl();
    // The API returns an array of arrays, we want to flatten it
    return Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;
  }

  // Admin methods (require admin permissions)
  static async createApiKey(server: string, permissions?: number): Promise<KeyReturnJson> {
    const params = new URLSearchParams({
      server: server
    });

    if (permissions !== undefined) {
      params.append('permissions', permissions.toString());
    }

    const response = await fetch(`${this.offstylesApiUrl}/admin/create_key?${params.toString()}`, {
      method: 'POST',
      credentials: 'include' // Include cookies for session authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error: JsonError = JSON.parse(errorText);
        throw new Error(`${error.code}: ${error.reason}`);
      } catch {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }

    return await response.json();
  }

  static async updateApiKey(server: string, permissions: number): Promise<boolean> {
    const params = new URLSearchParams({
      server: server,
      permissions: permissions.toString()
    });

    const response = await fetch(`${this.offstylesApiUrl}/update_key?${params.toString()}`, {
      method: 'POST',
      credentials: 'include' // Include cookies for session authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error: JsonError = JSON.parse(errorText);
        throw new Error(`${error.code}: ${error.reason}`);
      } catch {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }

    return await response.json();
  }

  static async getServerKeyInfo(serverName: string): Promise<ServerKeyInfo> {
    const params = new URLSearchParams({
      name: serverName
    });

    const response = await fetch(`${this.offstylesApiUrl}/server_key?${params.toString()}`, {
      credentials: 'include' // Include cookies for session authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error: JsonError = JSON.parse(errorText);
        throw new Error(`${error.code}: ${error.reason}`);
      } catch {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }

    return await response.json();
  }

  static async deleteApiKey(serverName: string): Promise<boolean> {
    const params = new URLSearchParams({
      name: serverName
    });

    const response = await fetch(`${this.offstylesApiUrl}/delete_key?${params.toString()}`, {
      method: 'DELETE',
      credentials: 'include' // Include cookies for session authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error: JsonError = JSON.parse(errorText);
        throw new Error(`${error.code}: ${error.reason}`);
      } catch {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }

    // Handle plain text response "true"
    const responseText = await response.text();
    return responseText === "true";
  }

  static async getRecentModerationLogs(filter?: ModerationTargetFilter): Promise<RecentModAction[]> {
    const params = new URLSearchParams();
    
    if (filter) {
      params.append('filter', filter);
    }

    const response = await fetch(`${this.offstylesApiUrl}/mod_logs_recent?${params.toString()}`, {
      credentials: 'include' // Include cookies for session authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error: JsonError = JSON.parse(errorText);
        throw new Error(`${error.code}: ${error.reason}`);
      } catch {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }

    return await response.json();
  }

  // Reverse moderator actions
  static async reverseModerationActions(moderatorSteamId: string, timeframeHours: number, reason: string): Promise<string> {
    const data = {
      moderator_steam_id: moderatorSteamId,
      timeframe_hours: timeframeHours,
      reason: reason
    };

    const response = await fetch(`${this.offstylesApiUrl}/reverse_moderator_actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include' // Include cookies for session authentication
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error: JsonError = JSON.parse(errorText);
        throw new Error(`${error.code}: ${error.reason}`);
      } catch {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }

    return await response.text();
  }
}

export default OffstylesApi;