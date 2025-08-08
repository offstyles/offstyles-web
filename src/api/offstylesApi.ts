import { Style } from '@/types/Style';
import Api from './api';
import type { Time } from '@/types/Time';
import type { User } from '@/types/User';

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

  static async moderateRecord(recordId: string, action: 'invalidate' | 'validate', reason: string): Promise<void> {
    const params = new URLSearchParams({
      id: recordId,
      action: action
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
}

export default OffstylesApi;