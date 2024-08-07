import {Database} from './database.js';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class Events extends Database {
  /** Contains all items raw data */
  public static Data : any[] = [];

  /** Fetches map data */
  public static async fetch() {
    console.log('📰 Fetching bank data');
    Events.Data = await Database.fetchData('/events');
    console.log(`📰 ${Events.Data.length} events found`);
  }
}
