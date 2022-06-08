// @flow strict
/*::
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { GameID, GameUpdate, MiniTheaterEvent, MiniTheaterID } from "@astral-atlas/wildspace-models";
*/

/*::
export type MiniTheaterConnectionService = {
  create: (gameId: GameID, (MiniTheaterEvent, MiniTheaterID) => mixed) => MiniTheaterConnection,
};  
export type MiniTheaterConnection = {
  close: () => void,
  setSubscription: (id: $ReadOnlyArray<MiniTheaterID>) => void,
};
*/

export const createMiniTheaterConnectionService = (data/*: WildspaceData*/)/*: MiniTheaterConnectionService*/ => { 
  const create = (gameId, onMiniTheaterEvent) => {
    const subscriptions = new Set()

    const close = () => {
      for (const subscription of subscriptions)
        subscription.unsubscribe()
      subscriptions.clear();
    };
    const setSubscription = (ids) => {
      close();
      for (const id of ids) {
        const onEvent = (event) => {
          onMiniTheaterEvent(event, id)
        }
        subscriptions.add(data.gameData.miniTheaterEvents.subscribe(id, onEvent));
      }
    }

    return { close, setSubscription };
  };

  return { create };
}