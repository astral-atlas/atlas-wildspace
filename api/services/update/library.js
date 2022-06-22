// @flow strict
/*::
import type { ServerUpdateChannel } from "./meta";
import type { ServerGameUpdateChannel } from "../update";
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { GameID, GameUpdate, LibraryEvent, LibraryChannel } from "@astral-atlas/wildspace-models";
import type { AssetService } from "../asset";

export type ServerLibraryChannel = ServerUpdateChannel<LibraryChannel>;
*/

export const createServerLibraryChannel = (data/*: WildspaceData*/, asset/*: AssetService*/, { game, send }/*: ServerGameUpdateChannel*/)/*: ServerLibraryChannel*/ => {
  let subscription = null;

  const createLibraryEvent = async (update) => {
    switch (update.type) {
      case 'monsterActors':
        const { result: monsterActors } = await data.gameData.monsterActors.query(game.id);
        return { type: 'monster-actors', monsterActors, assets: [] }
      case 'monsters':
        const { result: monsters } = await data.monsters.query(game.id);
        const monsterAssets = await asset.batchPeek(monsters
          .map(m => m.initiativeIconAssetId));
        return { type: 'monsters', monsters, assets: monsterAssets }
      case 'characters':
        const { result: characters } = await data.characters.query(game.id);
        const characterAssets = await asset.batchPeek(characters
          .map(c => c.initiativeIconAssetId));
        return { type: 'characters', characters, assets: characterAssets }
      case 'mini-theater':
        const { result: miniTheaters } = await data.gameData.miniTheaters.query(game.id);
        return { type: 'mini-theaters', miniTheaters, assets: [] }
      case 'scenes':
        const { result: scenes } = await data.gameData.scenes.query(game.id);
        return { type: 'scenes', scenes, assets: [] }
      case 'locations':
        const { result: locations } = await data.gameData.locations.query(game.id);
        const locationAssets = await asset.batchPeek(locations
          .map(l => l.background.type === 'image' && l.background.imageAssetId || null));
        return { type: 'locations', locations, assets: locationAssets }
      case 'exposition':
        const { result: expositions } = await data.gameData.expositions.query(game.id);
        return { type: 'expositions', expositions, assets: [] };
      case 'rooms':
        const { result: rooms } = await data.room.query(game.id);
        return { type: 'rooms', rooms };
      default:
        return null;
    }
  }

  const onGameUpdate = async (update) => {
    const event = await createLibraryEvent(update);
    if (!event)
      return;
    send({ type: 'library-event', event })
  }

  const onSubscribe = () => {
    subscription = data.gameUpdates.subscribe(game.id, onGameUpdate)
  };
  const onUnsubscribe = () => {
    subscription?.unsubscribe();
  }

  const update = (event) => {
    switch (event.type) {
      case 'library-subscribe':
        return onSubscribe()
      case 'library-unsubscribe':
        return onUnsubscribe();
    }
  };
  const close = async () => {
    onUnsubscribe();
  }
  return { update, close };
}