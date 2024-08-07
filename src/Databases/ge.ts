import {Database} from './database.js';
import _ from 'lodash';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class Ge extends Database {
  /** Contains all items raw data */
  public static Data : any[] = [];

  /** Fetches grand exchange data */
  public static async fetch() {
    console.log('💰 Fetching grand exchange data');
    Ge.Data = await Database.fetchData('/ge');
    console.log(`💰 ${Ge.Data.length} grand exchange items found`);
  }

  /** *
   * Gets the sell price of one item by its code
   * @param {string} code The code of the item
   * @return {number} The price of the item
   */
  public static getSellPriceForItem(code: string): number {
    const item: any | undefined = _.find(Ge.Data, (i: any) => i.code == code);
    if (!item || item.ge) return 0;
    return item.sell_price;
  }

  /** *
   * Gets the sell price of multiple items by their codes
   * @param {string} codes The codes of the items
   * @return {number} The price of the items
   */
  public static getSellPriceForItems(codes: string[]): number {
    return _.sumBy(codes, (code: string) => Ge.getSellPriceForItem(code));
  }
}
