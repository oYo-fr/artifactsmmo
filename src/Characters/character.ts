import {Http} from '../http.js';
import {AxiosResponse} from 'axios';
import {Map} from '../Databases/map.js';
import {Monsters} from '../Databases/monsters.js';
import {Resources} from '../Databases/resources.js';
import {Items} from '../Databases/items.js';
import {Bank} from '../Databases/bank.js';
import {Action} from '../Actions/action.js';
import {Fight} from '../Actions/fight.js';
import {QuestFight} from '../Actions/questFight.js';
import {Farm} from '../Actions/farm.js';
import {Craft} from '../Actions/craft.js';
import _ from 'lodash';
import Semaphore from 'ts-semaphore';

/**
 * Represents a character
 */
export abstract class Character {
  protected chooseAction?<T extends Action>(actionsCraft: T[], actionsFight: T[], actionsFarm: T[], actionsCook: T[]): Promise<T | undefined>;
  private static equipSemaphore: Semaphore = new Semaphore(1);

  /** The name of the character */
  name: string;
  /** The last know character data received from the server */
  public Data: any;
  /** The last know character cooldown received from the server */
  cooldown: any;

  /**
   * Constructor
   * @param {string} name The name of the character
   */
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Sends a post action, and waits for the cooldown to finish
   * @param {string} route The route to call
   * @param {any | undefined} payload The payload to send
   * @return {Promise<any>} The http response
   */
  protected async doPost(route: string, payload: any | undefined = undefined): Promise<any> {
    const response: AxiosResponse = await Http.actionsClient.post(route, payload);
    this.Data = response.data.data.character;
    this.cooldown = response.data.data.cooldown;
    await this.waitForCooldown();
    return response;
  }

  /**
   * Waits for the cooldown to finish
   * @return {Promise} The setTimeout promise
   */
  public waitForCooldown() {
    const waitfor = this.cooldown && this.cooldown.remaining_seconds > 0 ? this.cooldown.remaining_seconds : 0;
    if (waitfor > 0) {
      this.log(`🕓 Waiting for cooldown (${waitfor}s)`);
    }
    return new Promise( (resolve) => setTimeout(resolve, waitfor*1000) );
  }

  /**
   * Moves the character to the specified position
   * @param {{x: number, y: number}} location The location to move to
   */
  public async move(location: {x: number, y: number}) {
    if (this.Data.x == location.x && this.Data.y == location.y) return;
    this.log(`🚶🏽‍➡️ Moving to location [${location.x}, ${location.y}]`);
    await this.doPost(`/my/${this.name}/action/move`, location);
  }

  /**
   * Moves the character to the specified position
   * @param {string} type The map type to go to
   * @param {string} code The map code to go to
   */
  public async moveToClosest(type: string, code: string) {
    const map: {x: number, y: number} | null = Map.findClosest(type, code, this.Data);
    if (!map) throw new Error(`Location ${code} not found`);
    await this.move(map!);
  }

  /**
   * Refreshes character data
   */
  public async refresh() {
    this.log('♻️ Refreshing data');
    const response: AxiosResponse = await Http.dataClient.get(`/characters/${this.name}`);
    this.Data = response.data.data;
    this.cooldown = response.data.data.cooldown;
    await this.waitForCooldown();
  }

  /**
   * Drops all items to the bank
   */
  public async dropAllItemsToBank() {
    this.log(`🎁 Let\'s drop items to the bank`);
    for (let i = 0; i < this.Data.inventory.length; i++) {
      const item: any = this.Data.inventory[i];
      if (item.quantity > 0) {
        await this.moveToClosest('bank', 'bank');
        await this.doPost(`/my/${this.name}/action/bank/deposit`, item);
        await Bank.fetch();
      }
    }
    // Drop the gold
    this.log(`💰 Let\'s drop all the gold to the bank`);
    if (this.Data.gold > 0) {
      await this.moveToClosest('bank', 'bank');
      await this.doPost(`/my/${this.name}/action/bank/deposit/gold`, {quantity: this.Data.gold});
      await Bank.fetch();
    }
  }

  /** *
   * Withdraws an item from the bank at the specified quantity
   * @param {{code: string, quantity: number}} item The item to widthdraw with it's quantity
   */
  public async withdrawFromBank(item: {code: string, quantity: number}) {
    await this.moveToClosest('', 'bank');
    this.log(`🥷 Taking ${item.code} from bank`);
    await this.doPost(`/my/${this.name}/action/bank/withdraw`, item);
    await Bank.fetch();
  }

  /** *
   * Equips the item at the specified slot
   * @param {string} code The item to equip
   * @param {string} slot The slot to equip
   */
  public async equipItem(code: string, slot: string) {
    this.log(`🧥 Equip item for slot ${slot}`);
    await this.doPost(`/my/${this.name}/action/equip`, {code, slot});
  }

  /** *
   * Unequips the item at the specified slot
   * @param {string} slot The item to unequip
   */
  public async unequipItem(slot: string) {
    if (!this.Data[`${slot}_slot`] || this.Data[`${slot}_slot`] == '') return;
    this.log(`🚮 Unequip item for slot ${slot}`);
    await this.doPost(`/my/${this.name}/action/unequip`, {slot: slot});
  }

  /**
   * Tries to find a better equipment in the bank compared to the one that is currenlty equiped
   */
  public async findBetterEquipments() {
    const slots: {name: string, type: string, equip: string}[] = [
      {name: 'weapon_slot', type: 'weapon', equip: 'weapon'},
      {name: 'boots_slot', type: 'boots', equip: 'boots'},
      {name: 'shield_slot', type: 'shield', equip: 'shield'},
      {name: 'helmet_slot', type: 'helmet', equip: 'helmet'},
      {name: 'body_armor_slot', type: 'body_armor', equip: 'body_armor'},
      {name: 'leg_armor_slot', type: 'leg_armor', equip: 'leg_armor'},
      {name: 'ring1_slot', type: 'ring', equip: 'ring1'},
      {name: 'ring2_slot', type: 'ring', equip: 'ring2'},
      {name: 'amulet_slot', type: 'amulet', equip: 'amulet'},
      {name: 'artifact1_slot', type: 'artifact', equip: 'artifact11'},
      {name: 'artifact2_slot', type: 'artifact', equip: 'artifact12'},
      {name: 'artifact3_slot', type: 'artifact', equip: 'artifact13'},
    ];
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const newEquipment = await this.findBetterEquipment(this.Data[slot.name], slot.type);
      if (newEquipment && this.Data[slot.name] != newEquipment) {
        await this.withdrawFromBank({code: newEquipment, quantity: 1});
        await this.unequipItem(slot.equip);
        await this.equipItem(newEquipment, slot.equip);
      }
    }
  }

  /**
   * Tries to find a better equipment in the bank compared to the one that is currenlty equiped
   * @param {string} code The code of the quipment to compare
   * @param {string} type The type of equipments to search in the bank
   * @return {string | undefined} The code of a better equipment in the bank, if any
   */
  public async findBetterEquipment(code: string, type: string): Promise<string | undefined> {
    await this.exchangeTaskCoins();
    const availableEquipments = Bank.getItemsByType(type).map((i: any) => Items.getItemData(i.code));
    if (!availableEquipments || availableEquipments.length == 0) return undefined;

    const currentEquipment = Items.getItemData(code);
    const currentEquipmentNote = currentEquipment ? await this.giveNoteToEquipment(currentEquipment) : 0;

    let bestEquipment = currentEquipment;
    let bestEquipmentNote = currentEquipmentNote;
    for (let i = 0; i < availableEquipments.length; i++) {
      const e = availableEquipments[i];
      if (e.level <= this.Data.level) {
        const eNote = await this.giveNoteToEquipment(e);
        if (eNote > bestEquipmentNote) {
          bestEquipment = e;
          bestEquipmentNote = eNote;
        }
      }
    }
    if (bestEquipmentNote > currentEquipmentNote) return bestEquipment.code;
    else return undefined;
  }

  /**
   * Gives a note for an equipment
   * @param {string} equipment The equipment to evaluate
   * @return {number} The sum of effects on the equipment
   */
  public async giveNoteToEquipment(equipment: any): Promise<number> {
    return !equipment.effects ? 0 : _.sumBy(equipment.effects, (e: any) => e.value);
  }

  /**
   * Exchanges 3 task coins if available to something at the quest master
   */
  public async exchangeTaskCoins(): Promise<void> {
    const exchanges = Math.floor(Bank.getItemQuantity('tasks_coin') / 3);
    if (exchanges > 0) {
      this.log(`🥇 Exchanging task coins with task master for some loot`);
      await this.withdrawFromBank({code: 'tasks_coin', quantity: exchanges * 3});
      await this.moveToClosest('tasks_master', 'monsters');
      for (let i = 0; i < exchanges; i++) {
        await this.doPost(`/my/${this.name}/action/task/exchange`);
      }
      await this.dropAllItemsToBank();
    }
  }

  /**
   * Performs a fight action
   * @param {number} times Number of times the fight action is performed
   */
  public async fight(times:number = 1) {
    for (let i = 0; i < times; i++) {
      this.log('🥊 Fight!');
      const response: any = await this.doPost(`/my/${this.name}/action/fight`);
      if (response.data.data.fight.result == 'lose') break;
    }
  }

  /**
   * Gather resources where the character is
   * @param {number} times Number of times the action is performed
   */
  public async gatherResource(times:number = 1) {
    for (let i = 0; i < times; i++) {
      this.log('🪚 Gathering resources');
      await this.doPost(`/my/${this.name}/action/gathering`);
    }
  }

  /** *
   * Crafts an item
   * @param {string} code The code of the item to craft
   * @param {number} quantity The number of items to craft (default 1)
   */
  public async craft(code: string, quantity: number = 1) {
    this.log(`🔧 Crafing ${code}!`);
    await this.doPost(`/my/${this.name}/action/crafting`, {code, quantity});
  }

  /**
   * Go to the tasks master to get a new task
   */
  public async getNewQuest() {
    if (this.Data.task != '') return;
    this.log('🔖 Get a new quest from master');
    await this.moveToClosest('tasks_master', 'monsters');
    await this.doPost(`/my/${this.name}/action/task/new`);
  }

  /**
   * Go to the tasks master to validate the quest
   */
  public async validateQuest() {
    if (this.Data.task === '' || this.Data.task_progress < this.Data.task_total) return;
    this.log('✅ Validate task done');
    await this.moveToClosest('tasks_master', 'monsters');
    await this.doPost(`/my/${this.name}/action/task/complete`);
  }

  /** Play loop */
  public async play() {
    await this.dropAllItemsToBank();
    while (true) {
      try {
        await this.playOneTime();
      } catch (_ex) {}
    }
  }

  /** Play loop */
  public async playOneTime() {
    await this.validateQuest();
    await this.getNewQuest();
    await Character.equipSemaphore.use(async () => await this.findBetterEquipments());
    const actionQuest: Action | undefined = await this.makeDecision(true);
    if (actionQuest) {
      await actionQuest.do!();
    }
    const action: Action | undefined = await this.makeDecision(true);
    if (action) {
      await action.do!();
    }
    await this.dropAllItemsToBank();
    await this.refresh();
  }

  /**
   * Decide what to do next
   * @param {boolean} priorityToQuest Indicates if the quest has priority or not
   * @return {T | undefined} The next best action
   */
  public async makeDecision<T extends Action>(priorityToQuest: boolean = false): Promise<T | undefined> {
    const actionsFight: any[] = await Action.evaluateAllActionsForCharacter(Fight, this, Monsters.Data);

    if (priorityToQuest && this.Data.task_type == 'monsters') {
      const questFightAction = _.find(actionsFight, (a: any) => a.Element.code == this.Data.task);
      if (questFightAction) {
        const result: QuestFight = new QuestFight(questFightAction.Character, questFightAction.Element);
        return result as T;
      }
    }
    const craftables = _.filter(Items.Data, (item: any) => item.craft && item.craft.skill != 'cooking');
    const actionsCraft: any[] = await Action.evaluateAllActionsForCharacter(Craft, this, craftables);

    const farmingPositions: any[] = _.filter(Map.Data, (r: any) => {
      if (!r.content || r.content.type != 'resource') return false;
      const resourceData = Resources.getResourceData(r.content.code);
      return resourceData && resourceData.skill == 'woodcutting' || Resources.getResourceData(r.content.code).skill == 'mining';
    });
    const farmingResources: any[] = farmingPositions.map((p) => Resources.getResourceData(p.content.code));
    const actionsFarm: any[] = await Action.evaluateAllActionsForCharacter(Farm, this, _.uniqBy(farmingResources, 'code'));

    const fishingPositions: any[] = _.filter(Map.Data, (r: any) => {
      if (!r.content || r.content.type != 'resource') return false;
      const resourceData = Resources.getResourceData(r.content.code);
      return resourceData && resourceData.skill == 'fishing';
    });
    const fishingResources: any[] = fishingPositions.map((p) => Resources.getResourceData(p.content.code));
    const actionsFishing: any[] = await Action.evaluateAllActionsForCharacter(Farm, this, _.uniqBy(fishingResources, 'code'));
    const cookables = _.filter(Items.Data, (item: any) => item.craft && item.craft.skill === 'cooking');
    const actionsCook: any[] = await Action.evaluateAllActionsForCharacter(Craft, this, cookables);
    const cookActions: any[] = _.concat(actionsCook, actionsFishing);

    return await this.chooseAction!(actionsCraft, actionsFight, actionsFarm, cookActions);
  }

  /**
   * Logs a message to the console
   * @param {string} message The message to log
   */
  private log(message: string) {
    const name = `[${this.name}]`;
    console.log(`${name.padEnd(10)}\t${message}`);
  }
}
