import {Database} from './database.js';
import _ from 'lodash';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class Map extends Database {
  /** Contains all maps raw data */
  public static Data : any[] = [];

  /** Fetches map data */
  public static async fetch() {
    console.log(`🗺️ Fetching map data`);
    Map.Data = await Database.fetchData('/maps');
    console.log(`🗺️ ${Map.Data.length} maps found`);
  }

  /**
   * Finds the closes item of a certain type on the map
   * @param {string} type The type of the searched item
   * @param {string} code The code of the searched item
   * @param {{x: number, y: number}} location The location from witch to look for
   * @return {{x: number, y: number} | null} The location of the target (if any, null otherwise)
   */
  public static findClosest(type: string, code: string, location: {x: number, y: number}): {x: number, y: number} | null {
    const filtered = _.filter(Map.Data, function(m: any) {
      return m.content && (m.content.type == type || type == '') && m.content.code == code;
    });
    if (!filtered || filtered.length == 0) return null;
    const ordered = _.sortBy(filtered, [function(o: {x: number, y: number}) {
      return Map.distance(location, o);
    }]);
    return ordered[0];
  }
}
