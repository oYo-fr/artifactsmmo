import {Database} from './database.js';
import _ from 'lodash';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class Resources extends Database {
  /** Contains all resources raw data */
  public static Data : any[] = [];

  /** Fetches map data */
  public static async fetch() {
    console.log(`🪵 Fetching resources data`);
    Resources.Data = await Database.fetchData('/resources');
    console.log(`🪵 ${Resources.Data.length} resources found`);
  }

  /**
   * Returns the distance between two points
   * @param {string} code The code of the searched item
   * @return {any} The monster's data
   */
  public static getResourceData(code: string): any {
    const filtered = _.filter(Resources.Data, function(m: any) {
      return m.code == code;
    });
    return filtered[0];
  }
}
