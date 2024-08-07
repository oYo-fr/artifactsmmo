import {Database} from './database.js';
import _ from 'lodash';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class Monsters extends Database {
  /** Contains all monsters raw data */
  public static Data : any[] = [];

  /** Fetches map data */
  public static async fetch() {
    console.log(`👹 Fetching monsters data`);
    Monsters.Data = await Database.fetchData('/monsters');
    console.log(`👹 ${Monsters.Data.length} monsters found`);
  }

  /**
   * Returns the distance between two points
   * @param {string} code The code of the searched item
   * @return {any} The monster's data
   */
  public static getMonsterData(code: string): any {
    const filtered = _.filter(Monsters.Data, function(m: any) {
      return m.code == code;
    });
    return filtered[0];
  }

  /**
   * Returns the distance between two points
   * @param {number} level The code of the searched item
   * @param {{x: number, y: number}} location The location from witch to look for
   * @return {{x: number, y: number} | null} The location of the target (if any, null otherwise)
   */
  public static getClosestMonsterDataForLevel(level: number, location: {x: number, y: number}): any | null {
    const filtered = _.filter(Monsters.Data, function(m: any) {
      return m.level <= level;
    });
    if (!filtered || filtered.length == 0) return null;
    const ordered = _.sortBy(filtered, [function(o: {x: number, y: number}) {
      return Database.distance(location, o);
    }]);
    return ordered[0];
  }
}
