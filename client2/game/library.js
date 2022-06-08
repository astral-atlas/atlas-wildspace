// @flow strict
/*::
import type { GameID, LibraryData } from  "@astral-atlas/wildspace-models";
import type { HTTPServiceClient } from "../wildspace";
*/
import { gameAPI } from "@astral-atlas/wildspace-models";

/*::

export type LibraryClient = {
  get: (gameId: GameID) => Promise<LibraryData>
};
*/

export const createLibraryClient = (http/*: HTTPServiceClient*/)/*: LibraryClient*/ => {
  const libraryResource = http.createResource(gameAPI["/games/library"]);

  const get = async (gameId) => {
    const { body: { library }} = await libraryResource.GET({ query: { gameId }});
    return  library;
  };

  return { get };
}