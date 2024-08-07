import {Action} from './action.js';
import {Character} from '../Characters/character.js';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class Farm extends Action {
  /**
     *
     * @param {Character} character The character to play with
     * @param {any} item The item to craft
     */
  public constructor(character: Character, item: any) {
    super(character, item);
  }

  /**
   * Fetches map data
   * @return {Promise<void>} nothing
   * */
  public evaluate(): Promise<void> {
    this.WillSucceed = this.Character.Data[`${this.Element.skill}_level`] >= this.Element.level;
    return Promise.resolve();
  }

  /** *
   * Performs the action
   * @return {Promise<void>} The number of hit points taken
   */
  public async do(): Promise<void> {
    this.log(`I'm gonna farm a ${this.Element.code}`);
    await this.Character.moveToClosest('', this.Element.code);
    await this.Character.gatherResource(10);
  }
}
