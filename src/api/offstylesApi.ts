import Api from './api';
import type { Time } from '@/types/Time.ts';
import urlParams from '@/utils/urlParams';
class OffstylesApi extends Api {
  static offstylesApiUrl = 'https://offstyles.tommyy.dev/api';
  static async getTimesByMap(mapName: string) : Promise<Time[]>{
    const params = urlParams.get();
    this.url =`${this.offstylesApiUrl}/map_leaderboard?map=${mapName}&${params}`;
    return this.fetchFromUrl();
    //return await this.fakeFetch(sampleTimes);
  }
  static async getTimesByPlayer(steamID: string) : Promise<Time[]>{
    const params = urlParams.get();
    this.url =`${this.offstylesApiUrl}/player_times?steamid=${steamID}&${params}`;
    return this.fetchFromUrl();
    //return await this.fakeFetch(sampleTimes);
  }
  static async getMapsForAutoComplete(input: string) : Promise<string[]>{
    this.url =`${this.offstylesApiUrl}/autocomplete_maps?text=${input}`;
    return this.fetchFromUrl();
  }
}

export default OffstylesApi;