// @flow strict
/*::
import type {
  AdvancedGameCRUDAPIDescription,
  DeriveGameCRUDDescription,
  GameResourceDescription,
  GameMeta, GameResourceInputMetadata,
} from "@astral-atlas/wildspace-models";
import type { MiniTheaterAPI } from "../../models/api/game/miniTheater";
import type { LibraryData } from "../../models/game/library";
import type {
  WildspaceClient, GameCRUDClient,
  UpdatesConnection, GameResourceClient
} from "@astral-atlas/wildspace-client2";
*/

import { createMockUpdateConnection } from "./client/connection";
import { createMockMagicItem } from "./game";
import { createMockMiniTheater } from "./miniTheater";
import { randomHumanName } from "./random";
import { v4 } from "uuid";

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

export const createMockGameResourceClient = /*:: <T: GameResourceDescription<any>>*/(implementation/*: {
  getResources: () => $ReadOnlyArray<T["resource"]>,
  setResources: $ReadOnlyArray<T["resource"]> => mixed,
  createResource: ({ ...T["input"], ...GameMeta<string> }, ?T["resource"]) => T["resource"],
}*/)/*: GameResourceClient<T>*/ => {
  const { createResource, getResources, setResources } = implementation;
  const create = async (gameId, input) => {
    const resources = getResources();
    const newResource = createResource({ ...input, id: v4(), version: v4(), gameId }, null);
    setResources([...resources, newResource ])
  }
  const read = async () => {
    return getResources();
  };
  const update = async (gameId, id, input) => {
    const resources = getResources();
    setResources(resources.map(r => r.id === id ? createResource(input, r) : r));
  };
  const destroy = async (gameId, id) => {
    const resources = getResources();
    setResources(resources.filter(r => r.id === id));
  };
  return { create, read, update, destroy };
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
      },
      terrainProps: createMockGameResourceClient({
        getResources: () => getLibrary().terrainProps,
        setResources: (terrainProps) => onLibraryChange({ ...getLibrary(), terrainProps }),
        createResource: (input, prev) => ({ ...prev, ...input }),
      }),
    },
    magicItem: createMockGameCRUDClient(
      () => getLibrary().magicItems,
      magicItems => onLibraryChange({ ...getLibrary(), magicItems }),
      m => m.id,
      post => ({ ...createMockMagicItem(), ...post }),
      (put, v) => ({  ...v, ...put,})
    ),
    tags: createMockGameResourceClient({
      getResources: () => getLibrary().tags,
      setResources: (tags) => onLibraryChange({ ...getLibrary(), tags }),
      createResource: (input, prev) => ({ ...prev, ...input }),
    })
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