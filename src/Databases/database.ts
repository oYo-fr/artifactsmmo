import {Http} from './../http.js';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export abstract class Database {
  /**
   * @param {string} route The route to call
   * Fetches data */
  protected static async fetchData(route: string): Promise<any[]> {
    return await Http.fetch(route);
  }

  /**
   * Returns the distance between two points
   * @param {{x: number, y: number}} a The first point
   * @param {{x: number, y: number}} b The second point
   * @return {number} The distance between the two points
   */
  public static distance(a: {x: number, y: number}, b: {x: number, y: number}): number {
    return Math.sqrt(Math.pow(b.x-a.x, 2)+Math.pow(b.y-a.y, 2));
  }
}
