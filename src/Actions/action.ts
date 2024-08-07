import {Character} from '../Characters/character.js';
import _ from 'lodash';

/**
 * Wraps http calls to handle rate limits and perform calls
 */
export class Action {
  public WillSucceed: boolean = false;
  public evaluate?(): Promise<void>;
  public do?(): Promise<void>;

  /**
 *
 * @param {Character} Character The character to play with
 * @param {any} Element The monster to attack
 */
  public constructor(public Character: Character, public Element: any) {
  }

  /**
   * Creates all possibilities for an array of objects against a character
   * @param {T} Type The type of action to create
   * @param {Character} character The character to play with
   * @param {any[]} elements The objects to iterate with
   * @return {Promise<T[]>} A list of possible actions
   */
  public static async createAllPossibilitiesForCharacter<T extends Action>(Type: (new(c: Character, e: any) => T), character: Character, elements: any[]): Promise<T[]> {
    return Promise.resolve(elements.map((e) => new Type(character, e) as T));
  }

  /**
   * Creates all possibilities for an array of objects against a character
   * @param {T} Type The type of action to create
   * @param {Character} character The character to play with
   * @param {any[]} elements The objects to iterate with
   * @return {Promise<Action[]>} A list of possible actions
   */
  public static async evaluateAllActionsForCharacter<T extends Action>(Type: (new(c: Character, e: any) => T), character: Character, elements: any[]): Promise<T[]> {
    const allActions: T[] = await Action.createAllPossibilitiesForCharacter(Type, character, elements);
    await Promise.all(allActions.map((a: T) => a.evaluate!()));
    const possibleActions = _.filter(allActions, (e: Action) => e.WillSucceed);
    return Promise.resolve(possibleActions);
  }

  /**
  * Logs a message to the console
  * @param {string} message The message to log
  */
  protected log(message: string) {
    const name = `[${this.Character.name}]`;
    console.log(`${name.padEnd(10)}\t💡 ${message}`);
  }
}
