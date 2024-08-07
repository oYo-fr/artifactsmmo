import {Action} from '../Actions/action';
import {Character} from './character.js';
import {Ge} from '../Databases/ge.js';
import _ from 'lodash';

/**
 * Represents a farmer
 */
export class Fighter extends Character {
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
    // const orderedByMaxGoldDesc = _.orderBy(actionsFight, ['max_gold', ({Element}) => Element.drops.map((d: any) => Ge.getSellPriceForItem(d.code) / d.rate)], ['desc', 'desc']);
    // const actions = _.concat(orderedByMaxGoldDesc, actionsFarm, actionsCraft);
    const fightsOrderedByLevelDesc = _.orderBy(actionsFight, [({Element}) => Element.level], ['desc']);
    // const suffledFights = _.shuffle(actionsFight);
    const actions = _.concat(fightsOrderedByLevelDesc, actionsFarm, actionsCraft, actionsCook);
    if (!actions || actions.length == 0) return Promise.resolve(undefined);
    return Promise.resolve(actions[0]);
  }
}
