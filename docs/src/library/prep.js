// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { LibraryData } from "@astral-atlas/wildspace-models"
*/

import { GameMasterPrepLibrary } from "@astral-atlas/wildspace-components"
import { reduceMiniTheaterAction } from "@astral-atlas/wildspace-models"
import { ScaledLayoutDemo } from "../demo";
import { createMockAssetsForLibrary, createMockGame, createMockLibraryData, createMockWildspaceClient } from "@astral-atlas/wildspace-test"
import { h, useMemo, useState } from "@lukekaalim/act"
import { v4 as uuid } from 'uuid';
import { createMockMiniTheater } from "@astral-atlas/wildspace-test/mocks/miniTheater";

export const GameMasterPrepLibraryDemo/*: Component<>*/ = () => {
  const game = useMemo(() => createMockGame());
  const userId = useMemo(() => uuid());
  const [data, setData] = useState/*:: <LibraryData>*/(createMockLibraryData());

  const mockClient = createMockWildspaceClient(() => data, data => setData(data));
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
            name: name || prev.name,
          };
          setData({
            ...data,
            miniTheaters: [...data.miniTheaters.filter(m => m.id !== theaterId), next]
          })
          return next;
        },
        async act(gameId, theaterId, action) {
          setData(data => {
            const prev = data.miniTheaters.find(m => m.id === theaterId);
            if (!prev)
              throw new Error();
            const next = {
              ...reduceMiniTheaterAction(prev, action),
              version: uuid(),
            };
            return {
              ...data,
              miniTheaters: [...data.miniTheaters.filter(m => m.id !== theaterId), next]
            }
          });
        }
      }
    }
  }
  const updates = {
    miniTheater: {
      subscribe: (id, subscriber) => {
        const miniTheater = data.miniTheaters.find(m => m.id === id);
        if (miniTheater)
          subscriber(miniTheater);
        return () => {};
      },
      act: (action) => {
        console.log(action)
      }
    }
  };
  const assets = useMemo(() =>
    new Map(createMockAssetsForLibrary(data).map(a => [a.description.id, a])),
    [data]
  )

  return [
    h(ScaledLayoutDemo, { height: `${512+128}px` }, [
      h(GameMasterPrepLibrary, { assets, client, data, game, userId, updates }),
    ]),
  ]
}