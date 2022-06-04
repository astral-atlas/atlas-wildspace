// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { ScaledLayoutDemo } from "../demo";
import { GameMasterPrepLibrary } from "@astral-atlas/wildspace-components"
import { createMockGame, createMockLibraryData, createMockWildspaceClient } from "@astral-atlas/wildspace-test"
import { h, useMemo, useState } from "@lukekaalim/act"
import { v4 as uuid } from 'uuid';
import { createMockMiniTheater } from "@astral-atlas/wildspace-test/mocks/miniTheater";

export const GameMasterPrepLibraryDemo/*: Component<>*/ = () => {
  const game = useMemo(() => createMockGame());
  const userId = useMemo(() => uuid());
  const [data, setData] = useState(createMockLibraryData());
  const mockClient = createMockWildspaceClient();
  const client = {
    ...mockClient,
    game: {
      ...mockClient.game,
      miniTheater: {
        ...mockClient.game.miniTheater,
        create: async (gameId, { name }) => {
          const miniTheater = { ...createMockMiniTheater(), name };
          setData({
            ...data,
            miniTheaters: [...data.miniTheaters, miniTheater]
          })
          return miniTheater;
        },
        update: async (gameId, theaterId, { name }) => {
          const prev = data.miniTheaters.find(m => m.id === theaterId);
          if (!prev)
            throw new Error();
          const next = {
            ...prev,
            name,
          };
          setData({
            ...data,
            miniTheaters: [...data.miniTheaters.filter(m => m.id !== theaterId), next]
          })
          return next;
        }
      }
    }
  }
  const assets = new Map([
    
  ]);

  return [
    h(ScaledLayoutDemo, {}, [
      h(GameMasterPrepLibrary, { assets, client, data, game, userId }),
    ]),
  ]
}