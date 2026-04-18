import { Style } from '@/types/Style';
import Api from './api';
import type { Time, TimesPage } from '@/types/Time';
import type { TimesFilter } from '@/types/TimesFilter';
import type { User } from '@/types/User';
import type { RecentModAction, ModerationTargetFilter, ModerationAction } from '@/types/moderation';

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

export interface ServerActivityOwner {
  _id: string;
  steam_id: string;
  username: string;
  avatar_url: string;
}

export interface ServerActivityResponse {
  _id: string;
  name: string;
  servers: ServerInfo[];
  permissions: number;
  user: ServerActivityOwner;
  active: boolean;
}

export interface ServerDataDocument {
  _id?: string;
  name: string;
  servers?: ServerInfo[];
  user?: ServerActivityOwner;
  permissions?: number;
  active?: boolean;
}

export interface ServerInfo {
  name: string;
  ip: string;
  whitelist: boolean;
  password: boolean;
  vac_secure: boolean;
}

export interface KeyReturnJson {
  key: string;
}

export interface ServerKeyInfo {
  server: string;
  key: string;
  permissions: number;
}

export interface ModerationLogModerator {
  steam_id: string;
  username: string;
  avatar_url?: string;
}

export interface ModerationLogAction extends ModerationAction {
  mod: ModerationLogModerator;
}

export interface ModerationLogResponse {
  actions: ModerationLogAction[];
}

class OffstylesApi extends Api {
  static offstylesApiUrl = "/api";

  static async getTimes(filter: TimesFilter): Promise<TimesPage> {
    const params = new URLSearchParams();

    switch (filter.scope.kind) {
      case 'map':
        params.append("map", filter.scope.map);
        break;
      case 'player':
        params.append("steamid", filter.scope.steamid);
        break;
      case 'globals':
        if (filter.scope.recent) params.append("recent", "true");
        if (filter.scope.wr !== undefined) params.append("wr", filter.scope.wr.toString());
        break;
    }

    if (filter.style !== undefined && filter.style !== Style.all) {
      params.append("style", filter.style.toString());
    }
    if (filter.sort) params.append("sort", filter.sort);
    if (filter.best !== undefined) params.append("best", filter.best.toString());
    if (filter.has_replay) params.append("has_replay", "true");
    if (filter.invalidated !== undefined) {
      params.append("invalidated", filter.invalidated.toString());
    }
    params.append("page", filter.page.toString());
    params.append("limit", filter.limit.toString());

    const response = await fetch(`${this.offstylesApiUrl}/times?${params.toString()}`);
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

  // New methods based on the API spec
  static async getMapsForAutoComplete(text: string): Promise<string[]> {
    const params = new URLSearchParams({
      text: text,
    });

    this.url = `${this.offstylesApiUrl}/autocomplete_maps?${params.toString()}`;
    return await this.fetchFromUrl();
  }

  static async getPlayersForAutoComplete(text: string): Promise<[string, string][]> {
    const params = new URLSearchParams({
      text: text,
    });

    this.url = `${this.offstylesApiUrl}/autocomplete_players?${params.toString()}`;
    return await this.fetchFromUrl();
  }

  static async getSingleTime(id: string): Promise<Time> {
    const params = new URLSearchParams({ ids: id, limit: '1', page: '1' });
    const response = await fetch(`${this.offstylesApiUrl}/times?${params.toString()}`);
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error: JsonError = JSON.parse(errorText);
        throw new Error(`${error.code}: ${error.reason}`);
      } catch {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }
    const page: TimesPage = await response.json();
    if (page.data.length === 0) {
      throw new Error('404: Record not found');
    }
    return page.data[0];
  }

  static async getStyles(): Promise<ReturnStyle[]> {
    this.url = `${this.offstylesApiUrl}/styles`;
    return await this.fetchFromUrl();
  }

  static async downloadReplay(id: string): Promise<Response> {
    const params = new URLSearchParams({
      id: id,
    });

    const response = await fetch(`${this.offstylesApiUrl}/replay?${params.toString()}`, {
      credentials: "include", // Include cookies for session authentication
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
  static async moderatePlayer(
    steamId: string,
    action: "ban" | "unban",
    reason: string,
  ): Promise<void> {
    const params = new URLSearchParams({
      id: steamId,
      action: action,
    });

    const response = await fetch(`${this.offstylesApiUrl}/moderate_player?${params.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: reason,
      credentials: "include", // Include cookies for session authentication
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

  static async moderateRecord(
    recordId: string,
    action: "invalidate" | "revalidate",
    reason: string,
  ): Promise<void> {
    return this.moderateRecords([recordId], action, reason);
  }

  // Bulk moderation method for multiple records
  static async moderateRecords(
    recordIds: string[],
    action: "invalidate" | "revalidate",
    reason: string,
  ): Promise<void> {
    const params = new URLSearchParams({
      action: action,
      ids: recordIds.join(","), // Comma-separated values for the ids parameter
    });

    const response = await fetch(`${this.offstylesApiUrl}/moderate_record?${params.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: reason,
      credentials: "include", // Include cookies for session authentication
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
      steamid: steamId,
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
        credentials: "include", // Include cookies for session authentication
      });

      if (response.ok) {
        return await response.json();
      } else {
        return null; // Not authenticated or user not found
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
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
  static async getModerationLogs(id: string): Promise<ModerationLogResponse> {
    const params = new URLSearchParams({
      id: id,
    });

    const response = await fetch(`${this.offstylesApiUrl}/mod_logs?${params.toString()}`, {
      credentials: "include", // Include cookies for session authentication
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
  static async getServers(): Promise<ServerActivityResponse[]> {
    this.url = `${this.offstylesApiUrl}/servers`;
    const result = await this.fetchFromUrl();
    // The API returns an array of arrays, we want to flatten it
    return Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;
  }

  static async createServer(
    name: string,
    owner: string | undefined,
    servers: ServerInfo[],
    permissions?: number,
  ): Promise<KeyReturnJson> {
    const params = new URLSearchParams();

    if (permissions !== undefined) {
      params.append("permissions", permissions.toString());
    }

    const serverData = {
      name: name,
      owner: owner || null,
      servers: servers,
    };

    const response = await fetch(`${this.offstylesApiUrl}/admin/create_key?${params.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(serverData),
      credentials: "include",
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

    // The API returns the created key info as KeyReturnJson
    return await response.json();
  }

  // Admin methods (require admin permissions)
  static async createApiKey(server: string, permissions?: number): Promise<KeyReturnJson> {
    const params = new URLSearchParams({
      server: server,
    });

    if (permissions !== undefined) {
      params.append("permissions", permissions.toString());
    }

    const response = await fetch(`${this.offstylesApiUrl}/admin/create_key?${params.toString()}`, {
      method: "POST",
      credentials: "include", // Include cookies for session authentication
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
      permissions: permissions.toString(),
    });

    const response = await fetch(`${this.offstylesApiUrl}/update_key?${params.toString()}`, {
      method: "POST",
      credentials: "include", // Include cookies for session authentication
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
      name: serverName,
    });

    const response = await fetch(`${this.offstylesApiUrl}/server_key?${params.toString()}`, {
      credentials: "include", // Include cookies for session authentication
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
      name: serverName,
    });

    const response = await fetch(`${this.offstylesApiUrl}/delete_key?${params.toString()}`, {
      method: "DELETE",
      credentials: "include", // Include cookies for session authentication
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

  static async getRecentModerationLogs(
    filter?: ModerationTargetFilter,
  ): Promise<RecentModAction[]> {
    const params = new URLSearchParams();

    if (filter) {
      params.append("filter", filter);
    }

    const response = await fetch(`${this.offstylesApiUrl}/mod_logs_recent?${params.toString()}`, {
      credentials: "include", // Include cookies for session authentication
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
  static async reverseModerationActions(
    moderatorSteamId: string,
    timeframeHours: number,
    reason: string,
  ): Promise<string> {
    const data = {
      moderator_steam_id: moderatorSteamId,
      timeframe_hours: timeframeHours,
      reason: reason,
    };

    const response = await fetch(`${this.offstylesApiUrl}/reverse_moderator_actions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include", // Include cookies for session authentication
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

  // New server management methods
  static async addServerSubserver(targetId: string, servers: ServerInfo[]): Promise<ServerInfo[]> {
    const params = new URLSearchParams({
      target: targetId,
    });

    const response = await fetch(
      `${this.offstylesApiUrl}/servers/subservers/add?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(servers),
        credentials: "include",
      },
    );

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

  static async removeServerSubserver(
    targetId: string,
    servers: ServerInfo[],
  ): Promise<ServerInfo[]> {
    const params = new URLSearchParams({
      target: targetId,
    });

    const response = await fetch(
      `${this.offstylesApiUrl}/servers/subservers/remove?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(servers),
        credentials: "include",
      },
    );

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

  static async updateServerSubservers(
    targetId: string,
    servers: ServerInfo[],
  ): Promise<ServerInfo[]> {
    const params = new URLSearchParams({
      target: targetId,
    });

    const response = await fetch(
      `${this.offstylesApiUrl}/servers/subservers/update?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(servers),
        credentials: "include",
      },
    );

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

  static async updateServerName(targetId: string, name: string): Promise<ServerDataDocument> {
    const params = new URLSearchParams({
      target: targetId,
      name: name,
    });

    const response = await fetch(`${this.offstylesApiUrl}/servers/name?${params.toString()}`, {
      method: "POST",
      credentials: "include",
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

  static async updateServerOwner(
    targetId: string,
    ownerSteamId: string,
  ): Promise<ServerDataDocument> {
    const params = new URLSearchParams({
      target: targetId,
      owner: ownerSteamId,
    });

    const response = await fetch(`${this.offstylesApiUrl}/servers/owner?${params.toString()}`, {
      method: "POST",
      credentials: "include",
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
}

export default OffstylesApi;
