import {Character} from './Characters/character.js';
import {Map} from './Databases/map.js';
import {Monsters} from './Databases/monsters.js';
import {Items} from './Databases/items.js';
import {Resources} from './Databases/resources.js';
import {Bank} from './Databases/bank.js';
import {Events} from './Databases/events.js';
import {Ge} from './Databases/ge.js';
import {Http} from './http.js';
import _ from 'lodash';
import {Farmer} from './Characters/farmer.js';
import {Crafter} from './Characters/crafter.js';
import {Fighter} from './Characters/fighter.js';
import {Cook} from './Characters/cook.js';

/**
 * Mais class
 */
export class Main {
  /**
   * Hello world method
   * @param {string} who Who to say hello to.
   */
  public async play(who: string = 'world') {
    Http.init();

    const oyo = new Crafter('OyO');
    const crew : Character[] = [oyo, new Farmer('Mylene'), new Crafter('Punk'), new Cook('Gordon'), new Farmer('Elon')];
    // const crew : Character[] = [new Crafter('Punk')];

    await Promise.all(
        _.concat(crew.map((c: Character) => c.refresh()),
            [Map.fetch(), Monsters.fetch(), Items.fetch(), Resources.fetch(), Bank.fetch(), Events.fetch(), Ge.fetch()]));

    // const test = await crew[0].makeDecision();
    // console.log(test);
    // await characters[0].moveToClosest('', 'green_slime');
    // await characters[0].fight();
    // await Promise.all(_.concat(crew.map((c: Character) => c.play()), this.oYoPlay(oyo)));
    await Promise.all(crew.map((c: Character) => c.play()));
    // green_slimeball
    // const oYo: Character = new Character('OyO');
    // await oYo.refresh();
    // await Mylene.play();

    // await Mylene.dropAllItemsToBank();
    // await oYo.move(0, 1);
    // await oYo.waitForCooldown();
    // await oYo.fight(263);
    // await oYo.dropAllItemsToBank();
    return `Hello`;
  }

  /**
   * Creates reports for which weapons are the best agains each monster at certain levels
   * @param {string} who Who to say hello to.
   */
  public async think(who: string = 'world'): Promise<string> {
    Http.init();
    return 'ok';
  }

  /**
   * Play for oYo
   * @param {Fighter} oyo OyO character
   */
  private async oYoPlay(oyo: Fighter): Promise<void> {
    await oyo.refresh();
    // const cookedshrimps: number = Bank.getItemQuantity('cooked_shrimp');
    // const cookedgudgeons: number = Bank.getItemQuantity('cooked_gudgeon');
    // await oyo.withdrawFromBank({code: 'cooked_shrimp', quantity: cookedshrimps});
    // for (let i = 0; i < 124; i++) {
    //   await oyo.equipItem('cooked_shrimp', 'consumable1');
    // }
    // await oyo.withdrawFromBank({code: 'cooked_gudgeon', quantity: cookedgudgeons});
    // for (let i = 0; i < cookedgudgeons; i++) {
    //   await oyo.equipItem('cooked_gudgeon', 'consumable2');
    // }
    await oyo.moveToClosest('', 'mushmush');
    for (let i = 0; i < 397; i++) {
      await oyo.fight();
    }
  }
}

const m: Main = new Main();
m.play();
