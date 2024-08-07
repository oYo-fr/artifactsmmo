import {Database} from './database.js';
import {Items} from './items.js';
import _ from 'lodash';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class Bank extends Database {
  /** Contains all items raw data */
  public static Data : any[] = [];

  /** Fetches map data */
  public static async fetch() {
    console.log('🏦 Fetching bank data');
    Bank.Data = await Database.fetchData('/my/bank/items');
    console.log(`🏦 ${Bank.Data.length} items found in the bank`);
  }

  /**
  * Returns data of an item by it's code
  * @param {string} code The code of the searched item
  * @return {any | undefined} The item's data
  */
  public static getItemData(code: string): any | undefined {
    const filtered = _.filter(Bank.Data, function(m: any) {
      return m.code == code;
    });
    if (!filtered || filtered.length == 0) return undefined;
    return filtered[0];
  }

  /**
  * Returns an array of data in the bank that matches a specified type
  * @param {string} type The type of the searched items
  * @return {any[]} The item's data
  */
  public static getItemsByType(type: string): any[] {
    const filtered = _.filter(Bank.Data, function(m: any) {
      const itemInBank = Items.getItemData(m.code);
      return itemInBank.type == type;
    });
    return filtered;
  }

  /**
  * Returns the distance between two points
  * @param {string} code The code of the searched item
  * @return {any} The monster's data
  */
  public static getItemQuantity(code: string): number {
    const itemData = Bank.getItemData(code);
    if (!itemData || itemData.length == 0) return 0;
    return itemData.quantity;
  }
}
