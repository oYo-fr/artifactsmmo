import {Action} from './action.js';
import {Character} from '../Characters/character.js';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class QuestFight extends Action {
  /**
     *
     * @param {Character} character The character to play with
     * @param {any} monster The monster to attack
     */
  public constructor(character: Character, monster: any) {
    super(character, monster);
  }

  /**
   * Fetches map data
   * @return {Promise<void>} nothing
   * */
  public evaluate(): Promise<void> {
    this.WillSucceed = true;
    return Promise.resolve();
  }

  /** *
   * Performs the action
   * @return {Promise<void>} The number of hit points taken
   */
  public async do(): Promise<void> {
    this.log(`I'm gonna fight a ${this.Element.code} for my quest`);
    await this.Character.moveToClosest('', this.Element.code);
    await this.Character.fight(20);
  }
}
