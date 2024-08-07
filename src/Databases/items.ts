import {Database} from './database.js';
import _ from 'lodash';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class Items extends Database {
  /** Contains all items raw data */
  public static Data : any[] = [];

  /** Fetches map data */
  public static async fetch() {
    console.log('📦 Fetching items data');
    Items.Data = await Database.fetchData('/items');
    console.log(`📦 ${Items.Data.length} items found`);
  }

  /**
  * Returns data of an item by it's code
  * @param {string} code The code of the searched item
  * @return {any | undefined} The item's data
  */
  public static getItemData(code: string): any | undefined {
    const filtered = _.filter(Items.Data, function(m: any) {
      return m.code == code;
    });
    if (!filtered || filtered.length == 0) return undefined;
    return filtered[0];
  }
}
