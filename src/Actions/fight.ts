import {Action} from './action.js';
import {Character} from '../Characters/character.js';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class Fight extends Action {
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
    let playerHealth: number = this.Character.Data.hp;
    let monsterHealth: number = this.Element.hp;

    let oddRound: boolean = true;
    let cpt: number = 0;

    do {
      const dmg = this.evaluateAttack('air', oddRound ? this.Character.Data : this.Element, oddRound ? this.Element : this.Character.Data) +
        this.evaluateAttack('earth', oddRound ? this.Character.Data : this.Element, oddRound ? this.Element : this.Character.Data) +
        this.evaluateAttack('fire', oddRound ? this.Character.Data : this.Element, oddRound ? this.Element : this.Character.Data) +
        this.evaluateAttack('water', oddRound ? this.Character.Data : this.Element, oddRound ? this.Element : this.Character.Data);
      if (oddRound) monsterHealth -= dmg;
      else playerHealth -= dmg;
      oddRound = !oddRound;
      cpt++;
    } while (playerHealth >= 0 && monsterHealth >= 0 && cpt < 50);
    this.WillSucceed = cpt < 50 && playerHealth > 0;
    return Promise.resolve();
  }

  /** *
   * Attacks from one to another with air, earth, fire, or water
   * @param {string} kind The kind of attack to perform
   * @param {any} from The attacker
   * @param {any} to The attacked
   * @return {number} The number of hit points taken
   */
  private evaluateAttack(kind: string, from: any, to: any): number {
    const resistancePercent = to[`res_${kind}`];
    const result: number = from[`attack_${kind}`] * (1 - (resistancePercent/100));
    return result < 0 ? 0 : Math.round(result);
  }

  /** *
   * Performs the action
   * @return {Promise<void>} The number of hit points taken
   */
  public async do(): Promise<void> {
    this.log(`I'm gonna fight a ${this.Element.code}`);
    await this.Character.moveToClosest('', this.Element.code);
    await this.Character.fight(20);
  }
}
