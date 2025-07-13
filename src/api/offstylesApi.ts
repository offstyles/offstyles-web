import Api from './api';
import type { Time } from '@/types/Time.ts';
import urlParams from '@/utils/urlParams';
import { Style } from '@/types/Style';
class OffstylesApi extends Api {
  static offstylesApiUrl = 'https://offstyles.tommyy.dev/api';
  static async getTimesByMap(mapName: string) : Promise<Time[]>{
    let paramsObj = urlParams.getAsObject();
    paramsObj.style = paramsObj.style ?? Style.normal;
    const params = new URLSearchParams(paramsObj).toString();
    this.url =`${this.offstylesApiUrl}/map?map=${mapName}&${params}`;
    return this.fetchFromUrl();
    //return await this.fakeFetch(sampleTimes);
  }
  static async getTimesByPlayer(steamID: string) : Promise<Time[]>{
    let paramsObj = urlParams.getAsObject();
    paramsObj.style = paramsObj.style ?? Style.normal;
    const params = new URLSearchParams(paramsObj).toString();
    this.url =`${this.offstylesApiUrl}/times?steamid=${steamID}&${params}`;
    return this.fetchFromUrl();
    //return await this.fakeFetch(sampleTimes);
  }
  static async getMapsForAutoComplete(input: string) : Promise<string[]>{
    this.url =`${this.offstylesApiUrl}/autocomplete_maps?text=${input}`;
    return this.fetchFromUrl();
  }
}

export default OffstylesApi;