// @flow strict
/*::
import type { WikiDoc, WikiDocID } from "@astral-atlas/wildspace-models";
import type { GameUpdatesConnection } from "../updates";
import type { GameUpdateChannel } from "./meta";
import type { WikiDocClient } from "../wiki";
import type { WikiDocAction } from "../../../models/game/wiki/actions";
import type { WikiDocState } from "../../../models/game/wiki/state";
*/
import { reduceWikiDocStateEvent, wikiDocChannel } from "@astral-atlas/wildspace-models";
import { createUpdateChannel } from "./meta.js";

/*::
export type WikiDocConnection = {
  ...GameUpdateChannel<WikiDocID, WikiDocState>,
  act: (wikiDocId: WikiDocID, action: WikiDocAction) => void
};
*/

export const createWikiDocConnection = (
  wikiDocClient/*: WikiDocClient*/,
  updates/*: GameUpdatesConnection*/
)/*: WikiDocConnection*/ => {
  const channel = createUpdateChannel(wikiDocChannel, {
    createSubscribeEvent(id, ids) {
      return { type: 'wikidoc-subscribe', wikiDocId: id }
    },
    createUnsubscribeEvent(id, ids) {
      return { type: 'wikidoc-unsubscribe', wikiDocId: id }
    },
    getInitialResource(gameId, wikiDocId) {
      return wikiDocClient.getStateById(gameId, wikiDocId);
    },
    getIds(message) {
      return [message.wikiDocId];
    },
    reduceResourceEvent(wikiDoc, { wikiDocEvent }) {
      return reduceWikiDocStateEvent(wikiDoc, wikiDocEvent);
    },
    getChannelMessage(updateEvent) {
      switch (updateEvent.type) {
        case 'wikidoc-event':
          return updateEvent;
      }
    }
  }, updates);

  const act = (wikiDocId, wikiDocAction) => {
    updates.send({ type: 'wikidoc-action', wikiDocId, wikiDocAction })
  }

  return {
    ...channel,
    act
  }
}