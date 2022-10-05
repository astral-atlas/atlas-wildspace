// @flow strict
/*::
import type { LibraryData } from "../../models/game/library";
import type { WildspaceClient, GameCRUDClient, UpdatesConnection } from "@astral-atlas/wildspace-client2";
*/

import { createMockUpdateConnection } from "./client/connection";
import { randomHumanName } from "./random";

export const createMockGameCRUDClient = ()/*: GameCRUDClient<any>*/ => {
  const read = async () => {
    throw new Error(`Mock Function!`)
  };
  const create = async () => {
    throw new Error(`Mock Function!`)
  };
  const update = async () => {
    throw new Error(`Mock Function!`)
  }
  const destroy = async () => {
    throw new Error(`Mock Function!`)
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
      ...createMockGameCRUDClient(),
      async act() {
        throw new Error();
      }
    }
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