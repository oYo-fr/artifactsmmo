import {Action} from './action.js';
import {Character} from '../Characters/character.js';
import {Bank} from '../Databases/bank.js';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class Craft extends Action {
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
    if (this.Element.craft) {
      if (this.Character.Data[`${this.Element.craft.skill}_level`] >= this.Element.craft.level) {
        let canDo: boolean = true;
        this.Element.craft.items.forEach((component: any) => {
          if (Bank.getItemQuantity(component.code) < component.quantity) canDo = false;
        });
        this.WillSucceed = canDo;
      }
    }
    return Promise.resolve();
  }

  /** *
   * Performs the action
   * @return {Promise<void>} The number of hit points taken
   */
  public async do(): Promise<void> {
    this.log(`I'm gonna craft a ${this.Element.code}`);
    await this.Character.moveToClosest('', 'bank');
    for (let i = 0; i < this.Element.craft.items.length; i++) {
      await this.Character.withdrawFromBank(this.Element.craft.items[i]);
    }
    await this.Character.moveToClosest('', this.Element.craft.skill);
    await this.Character.craft(this.Element.code);
  }
}
