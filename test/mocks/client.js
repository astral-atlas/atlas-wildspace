// @flow strict
/*::
import type { WildspaceClient, GameCRUDClient } from "@astral-atlas/wildspace-client2";
*/

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

export const createMockWildspaceClient = ()/*: WildspaceClient*/ => {
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
  const self = async () => {
    return { name: randomHumanName() }
  }

  return {
    asset,
    audio,
    game,
    room,
    self,
  }
};
