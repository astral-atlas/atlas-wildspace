// @flow strict
/*::
import type {
  AdvancedGameCRUDAPIDescription,
  DeriveGameCRUDDescription,
} from "../../models/api/game/meta";
import type { MiniTheaterAPI } from "../../models/api/game/miniTheater";
import type { LibraryData } from "../../models/game/library";
import type { WildspaceClient, GameCRUDClient, UpdatesConnection } from "@astral-atlas/wildspace-client2";
*/

import { createMockUpdateConnection } from "./client/connection";
import { createMockMagicItem } from "./game";
import { createMockMiniTheater } from "./miniTheater";
import { randomHumanName } from "./random";

export const createMockGameCRUDClient = /*:: <T: AdvancedGameCRUDAPIDescription>*/(
  getList/*: () => $ReadOnlyArray<T['resource']>*/,
  onListChange/*: T['resource'][] => mixed*/,
  getId/*: T['resource'] => string*/,
  createListElement/*: T['resourcePostInput'] => T['resource']*/,
  updateListElement/*: (T['resourcePutInput'], T['resource']) => T['resource']*/
)/*: GameCRUDClient<T>*/ => {
  const read = async () => {
    return getList();
  };
  const create = async (_, t) => {
    onListChange([...getList(), createListElement(t)])
  };
  const update = async (_, id, t) => {
    onListChange(getList().map(et => getId(et) === id ? updateListElement(t, et) : et))
  }
  const destroy = async (_, id) => {
    onListChange(getList().filter(et => getId(et) !== id))
  };

  return {
    read,
    create,
    update,
    destroy,
  };
}

export const createMockWildspaceClient = (
  getLibrary/*: () => LibraryData*/ = () => { throw new Error() },
  onLibraryChange/*: LibraryData => mixed*/ = _ => {},
)/*: WildspaceClient*/ => {
  const game/*: any*/ = {
    miniTheater: {
      ...createMockGameCRUDClient(
        () => getLibrary().miniTheaters,
        miniTheaters => onLibraryChange({ ...getLibrary(), miniTheaters }),
        m => m.id,
        post => ({ ...createMockMiniTheater(), ...post }),
        (put, v) => ({ ...v, ...put,  })
      ),
      async act() {
        throw new Error();
      }
    },
    magicItem: createMockGameCRUDClient(
      () => getLibrary().magicItems,
      magicItems => onLibraryChange({ ...getLibrary(), magicItems }),
      m => m.id,
      post => ({ ...createMockMagicItem(), ...post }),
      (put, v) => ({  ...v, ...put,})
    ),
  };
  const asset/*: any*/ = {

  };
  const audio/*: any*/ = {

  };
  const room/*: any*/ = {

  };
  const page/*: any*/ = {

  };
  const updates/*: UpdatesConnection*/ = createMockUpdateConnection(
    getLibrary,
    onLibraryChange,
  );
  const self = async () => {
    return { name: randomHumanName() }
  }

  return {
    asset,
    audio,
    game,
    room,
    updates: { create: async () => updates },
    page,
    self,
  }
};

export * from './client/webAssetMock.js';