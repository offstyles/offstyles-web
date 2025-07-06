import Api from './api';
import sampleTimes from '../sampleTimes.ts';
import type { Time } from '@/types/Time.ts';
class OffstylesApi extends Api {
  static offstylesApiUrl = 'https://offstyles.tommyy.dev/api';
  static async getMapsList(){
    this.url =`${this.offstylesApiUrl}/mapsList`;
    //return await this.fetchFromUrl();
    return await this.fakeFetch([
      {id:1,name:'bhop_beginner'},
      {id:2,name:'bhop_easy'},
      {id:3,name:'bhop_hard'},
      {id:4,name:'bhop_bigmichael'},
      {id:5,name:'bhop_idk'},
      {id:6,name:'bhop_update'},
    ]);
  }
  static async getTimesByMap(mapName: string) : Promise<Time[]>{
    this.url =`${this.offstylesApiUrl}/map_leaderboard?map=${mapName}`;
    return this.fetchFromUrl();
    //return await this.fakeFetch(sampleTimes);
  }
  static async getMapsForAutoComplete(input: string) : Promise<string[]>{
    this.url =`${this.offstylesApiUrl}/autocomplete_maps?text=${input}`;
    return this.fetchFromUrl();
  }
}

export default OffstylesApi;