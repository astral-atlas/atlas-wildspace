// @flow strict
/*::
import type { Character, Monster } from "../character";
import type { MonsterActor } from "../monster/monsterActor";
import type { Exposition } from "./exposition";
import type { Location } from "./location";
import type { MiniTheater } from "./miniTheater";
import type { Scene } from "./scene";
import type { Cast } from "@lukekaalim/cast/main";
*/

import { castMonster } from "../character.js";
import { castCharacter } from "../character.js";
import { castMonsterActor } from "../monster/monsterActor.js";
import { castExposition } from "./exposition.js";
import { castLocation } from "./location.js";
import {
  castMiniTheater,
} from "./miniTheater.js";
import { castScene } from "./scene.js";
import { c } from "@lukekaalim/cast";

/*::
export type LibraryData = {|
  characters: $ReadOnlyArray<Character>,
  monsters: $ReadOnlyArray<Monster>,

  monsterActors: $ReadOnlyArray<MonsterActor>,

  miniTheaters: $ReadOnlyArray<MiniTheater>,
  scenes: $ReadOnlyArray<Scene>,
  expositions: $ReadOnlyArray<Exposition>,

  locations: $ReadOnlyArray<Location>,
|};
*/
export const castLibraryData/*: Cast<LibraryData>*/ = c.obj({
  characters: c.arr(castCharacter),
  monsters: c.arr(castMonster),

  monsterActors: c.arr(castMonsterActor),

  miniTheaters: c.arr(castMiniTheater),
  scenes: c.arr(castScene),
  expositions: c.arr(castExposition),
  locations: c.arr(castLocation),
});

/*::
export type LibraryEvent =
  | {
      type: 'characters',
      characters: $ReadOnlyArray<Character>
    }
  | {
      type: 'monsters',
      monsters: $ReadOnlyArray<Monster>
    }
  | {
      type: 'monster-actors',
      monsterActors: $ReadOnlyArray<MonsterActor>
    }
  | {
      type: 'mini-theaters',
      miniTheaters: $ReadOnlyArray<MiniTheater>,
    }
  | {
      type: 'scenes',
      scenes: $ReadOnlyArray<Scene>,
    }
  | {
      type: 'expositions',
      expositions: $ReadOnlyArray<Exposition>,
    }
  | {
      type: 'locations',
      locations: $ReadOnlyArray<Location>,
    }
*/

export const castLibraryEvent/*: Cast<LibraryEvent>*/ = c.or('type', {
  'characters': c.obj({
    type: c.lit('characters'),
    characters: c.arr(castCharacter)
  }),
  'monsters': c.obj({
    type: c.lit('monsters'),
    monsters: c.arr(castMonster)
  }),
  'monster-actors': c.obj({
    type: c.lit('monster-actors'),
    monsterActors: c.arr(castMonsterActor)
  }),
  'mini-theaters': c.obj({
    type: c.lit('mini-theaters'),
    miniTheaters: c.arr(castMiniTheater),
  }),
  'expositions': c.obj({
    type: c.lit('expositions'),
    expositions: c.arr(castExposition),
  }),
  'scenes': c.obj({
    type: c.lit('scenes'),
    scenes: c.arr(castScene),
  }),
  'locations': c.obj({
    type: c.lit('locations'),
    locations: c.arr(castLocation),
  }),
});
