import {TOKEN} from './consts.js';
import axios, {AxiosResponse} from 'axios';
import rateLimit from 'axios-rate-limit';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class Http {
  public static dataClient : any;
  public static actionsClient : any;

  /** Initialization method */
  public static init() {
    const axiosOptions: any = {
      baseURL: 'https://api.artifactsmmo.com',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
    };
    Http.dataClient = rateLimit(axios.create(axiosOptions), {maxRPS: 10});
    Http.actionsClient = rateLimit(axios.create(axiosOptions), {maxRPS: 5});
  }

  /**
   * Fetches data from the specified route
   * @param {string} route The route to fetch data from
   * @return {any[]} The feteched data (all pages if any)
   */
  public static async fetch(route: string): Promise<any[]> {
    let result: any[] = [];
    try {
      let page: number = 0;
      let totalPages: number = 0;
      do {
        const response: AxiosResponse = await Http.dataClient.get(route, {params: {page: page + 1, size: 100}});
        result = result.concat(response.data.data);
        page = response.data.page;
        totalPages = response.data.pages;
      } while (page < totalPages);
    } catch (error) {
      // console.error(error);
    }
    return result;
  }
}
