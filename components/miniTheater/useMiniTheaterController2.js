// @flow strict

import { useEffect, useState } from "@lukekaalim/act";
import { v4 } from "uuid";
import { hasLayerPermission, isBoardPositionEqual } from "@astral-atlas/wildspace-models";

/*::
import type {
  TerrainPlacementID,
  TerrainPropID,
  PieceID,
  MiniTheaterID,
  MiniTheaterChannel,
  GamePage,
  MiniTheater, BoardPosition,
  PieceRepresents,
  MiniTheaterAction,
  EditingLayerID
} from "@astral-atlas/wildspace-models";
import type {
  UpdatesConnection
} from '@astral-atlas/wildspace-client2';
import type { MiniTheaterRenderResources } from "./useMiniTheaterResources";

type MiniTheaterSelection =
  | { type: 'none' }
  | {
      type: 'placement',
      placement:
        | { type: 'piece', represents: PieceRepresents }
        | { type: 'terrain', terrain: TerrainPropID }
    }
  | { type: 'piece', pieceId: PieceID }
  | { type: 'terrain-prop', terrainId: TerrainPlacementID }

export type MiniTheaterLocalState = {
  isGM: boolean,
  resources: MiniTheaterRenderResources,
  miniTheater: MiniTheater,
  layer: ?EditingLayerID,
  cursor: ?BoardPosition,
  selection: MiniTheaterSelection
};

export type MiniTheaterLocalAction =
  | { type: 'select', selection: MiniTheaterSelection }
  | { type: 'move-cursor', cursor: ?BoardPosition }
  | { type: 'set-layer', layerId: ?EditingLayerID }
  | {
      type: 'update',
      update:
        | { type: 'resources', resources: MiniTheaterRenderResources }
        | { type: 'mini-theater', miniTheater: MiniTheater }
    }
  | { type: 'remote-action', remoteAction: MiniTheaterAction }
*/

/*::
export type MiniTheaterController2 = {
  subscribe: (
    subscriber: (state: MiniTheaterLocalState) => mixed
  ) => { unsubscribe: () => void },

  act: (action: MiniTheaterLocalAction) => void,
};
*/

export const reduceLocalState = (
  state/*: MiniTheaterLocalState*/,
  action/*: MiniTheaterLocalAction*/
)/*: MiniTheaterLocalState*/ => {
    switch (action.type) {
      case 'move-cursor':
        if (state.cursor && action.cursor && isBoardPositionEqual(state.cursor, action.cursor))
          return state;
        return {
          ...state,
          cursor: action.cursor,
        }
      case 'update':
        switch (action.update.type) {
          case 'resources':
            return {
              ...state,
              resources: action.update.resources
            }
          case 'mini-theater':
            return {
              ...state,
              miniTheater: action.update.miniTheater
            }
          default:
            return state;
        }
      case 'remote-action':
        switch (action.remoteAction.type) {
          case 'move-piece':
            return state;
          default:
            return {
              ...state,
              selection: { type: 'none' }
            }
        }
      case 'select':
        return {
          ...state,
          selection: action.selection,
        }
      case 'set-layer':
        return {
          ...state,
          layer: action.layerId,
        }
      default:
        return state;
    }
};

export const createMiniTheaterController2 = (
  resources/*: MiniTheaterRenderResources*/,
  miniTheater/*: MiniTheater*/,
  onRemoteAction/*: (MiniTheaterAction) => mixed*/,
  isGM/*: boolean*/ = false,
)/*: MiniTheaterController2*/ => {
  const subscribers = new Map();
  let localState/*: MiniTheaterLocalState*/ = {
    isGM,
    resources,
    miniTheater,
    layer: miniTheater.layers.find(l => hasLayerPermission(l))?.id,
    cursor: null,
    selection: { type: 'none' }
  };
  
  const subscribe = (subscriber) => {
    const id = v4();
    subscribers.set(id, subscriber);
    subscriber(localState);
    const unsubscribe = () => {
      subscribers.delete(id);
    }
    return { unsubscribe };
  };
  const act = (action) => {
    if (action.type === 'remote-action') {
      onRemoteAction(action.remoteAction);
    }
    const prevState = localState;
    localState = reduceLocalState(prevState, action);
    if (prevState !== localState)
      for (const subscriber of subscribers.values())
        subscriber(localState)
  };

  return {
    subscribe,
    act,
  }
}

export const useMiniTheaterController2 = (
  miniTheaterId/*: MiniTheaterID*/,
  resources/*: MiniTheaterRenderResources*/,
  connection/*: UpdatesConnection*/,
  isGM/*: boolean*/ = false,
)/*: ?MiniTheaterController2*/ => {
  const [controller, setController] = useState/*:: <?MiniTheaterController2>*/(null);

  useEffect(() => {
    const onRemoteAction = (action) => {
      connection.miniTheater.act(miniTheaterId, action);
    }
    const unsubscribe = connection.miniTheater.subscribe(miniTheaterId, miniTheater => {
      setController(controller => {
        if (!controller)
          return createMiniTheaterController2(resources, miniTheater, onRemoteAction, isGM);
        controller.act({ type: 'update', update: { type: 'mini-theater', miniTheater } });
        return controller;
      })
    });
    return () => {
      unsubscribe();
    }
  }, [resources, connection, miniTheaterId]);

  return controller;
};
