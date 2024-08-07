import {Action} from '../Actions/action';
import {Character} from './character.js';
import _ from 'lodash';

/**
 * Represents a farmer
 */
export class Farmer extends Character {
  /**
   * Constructor
   * @param {string} name The name of the character
   */
  constructor(name: string) {
    super(name);
  }

  /** *
   * Chooses an action from the provided ones
   * @param {Action[]} actionsCraft Crafting actions
   * @param {Action[]} actionsFight Fighting actions
   * @param {Action[]} actionsFarm Farming actions
   * @param {Action[]} actionsCook Cooking actions
   * @return {Action | undefined} The action the character has choosed
   */
  protected chooseAction<T extends Action>(actionsCraft: T[], actionsFight: T[], actionsFarm: T[], actionsCook: T[]): Promise<T | undefined> {
    const suffledFarmActions = _.shuffle(actionsFarm);
    const actions = _.concat(suffledFarmActions, actionsCraft, actionsFight, actionsCook);
    // const sortedFarmActions = _.orderBy(actionsFarm, [(action: any) => {
    //   return !action.Element.drops ? 0 : _.sumBy(action.Element.drops, (drop: any) => Bank.getItemQuantity(drop.code));
    // }], ['asc']);
    // const actions = _.concat(sortedFarmActions, actionsCraft, actionsFight, actionsCook);
    if (!actions || actions.length == 0) return Promise.resolve(undefined);
    return Promise.resolve(actions[0]);
  }
}
