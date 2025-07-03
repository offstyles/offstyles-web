import Api from './api';
import sampleTimes from '../sampleTimes.ts';
import type { Time } from '@/types/Time.ts';
class OffstylesApi extends Api {
  static offstylesApiUrl = 'https://example.com';
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
    this.url =`${this.offstylesApiUrl}/mapTimes?map=${mapName}`;
    //return this.fetchFromUrl();
    return await this.fakeFetch(sampleTimes);
  }
}

export default OffstylesApi;