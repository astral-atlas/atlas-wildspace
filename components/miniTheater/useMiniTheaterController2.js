// @flow strict

import { useEffect, useMemo, useState } from "@lukekaalim/act";
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
export type MiniTheaterTool =
  | { type: 'none' }
  | { type: 'place' }
  | { type: 'translate' }
  | { type: 'rotate' }
  | { type: 'scale' }

export type MiniTheaterLocalState = {
  isGM: boolean,
  resources: MiniTheaterRenderResources,
  miniTheater: MiniTheater,
  layer: ?EditingLayerID,
  cursor: ?BoardPosition,
  terrainCursor: ?TerrainPlacementID,
  selection: MiniTheaterSelection,
  tool: MiniTheaterTool,

  targetMode: 'pieces' | 'terrain',
};

export type MiniTheaterLocalAction =
  | { type: 'select', selection: MiniTheaterSelection }
  | { type: 'move-cursor', cursor: ?BoardPosition }
  | { type: 'move-terrain-cursor', terrainCursor: ?TerrainPlacementID }
  | { type: 'set-layer', layerId: ?EditingLayerID }
  | {
      type: 'update',
      update:
        | { type: 'resources', resources: MiniTheaterRenderResources }
        | { type: 'mini-theater', miniTheater: MiniTheater }
    }
  | { type: 'set-tool', tool: MiniTheaterTool }
  | { type: 'remote-action', remoteAction: MiniTheaterAction }
  | { type: 'set-target-mode', targetMode: 'pieces' | 'terrain' }
*/

/*::
export type MiniTheaterController2 = {
  subscribe: (
    subscriber: (state: MiniTheaterLocalState) => mixed
  ) => { unsubscribe: () => void },

  getState: () => MiniTheaterLocalState,
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
          case 'set-terrain':
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
      case 'set-target-mode':
        if (state.targetMode === action.targetMode)
          return state;
        return {
          ...state,
          targetMode: action.targetMode,
        }
      case 'set-tool':
        return {
          ...state,
          tool: action.tool,
        };
      case 'move-terrain-cursor':
        if (state.terrainCursor === action.terrainCursor)
          return state;
        return {
          ...state,
          terrainCursor: action.terrainCursor,
        }
      default:
        return state;
    }
};

export const createMiniTheaterController2 = (
  resources/*: MiniTheaterRenderResources*/,
  miniTheater/*: MiniTheater*/,
  isGM/*: boolean*/ = false,
)/*: MiniTheaterController2*/ => {
  const subscribers = new Map();
  let localState/*: MiniTheaterLocalState*/ = {
    isGM,
    resources,
    miniTheater,
    layer: miniTheater.layers.find(l => hasLayerPermission(l))?.id,
    cursor: null,
    terrainCursor: null,
    targetMode: 'pieces',
    tool: { type: 'place' },
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
    const prevState = localState;
    localState = reduceLocalState(prevState, action);
    if (prevState !== localState)
      for (const subscriber of subscribers.values())
        subscriber(localState)
  };
  const getState = () => {
    return localState;
  }

  return {
    subscribe,
    getState,
    act,
  }
}

export const useMiniTheaterController2 = (
  miniTheaterId/*: ?MiniTheaterID*/ = null,
  resources/*: MiniTheaterRenderResources*/,
  connection/*: ?UpdatesConnection*/ = null,
  isGM/*: boolean*/ = false,
)/*: ?MiniTheaterController2*/ => {
  const [controller, setController] = useState/*:: <?MiniTheaterController2>*/(null);

  useEffect(() => {
    if (!miniTheaterId || !connection)
      return;
    
    const unsubscribe = connection.miniTheater.subscribe(miniTheaterId, miniTheater => {
      setController(controller => {
        if (!controller || controller.getState().miniTheater.id !== miniTheaterId)
          return createMiniTheaterController2(resources, miniTheater, isGM);
        controller.act({ type: 'update', update: { type: 'mini-theater', miniTheater } });
        return controller;
      })
    });
    return () => {
      unsubscribe();
    }
  }, [connection, miniTheaterId]);

  useEffect(() => {
    setController(controller => {
      if (!controller)
        return null;
      controller.act({ type: 'update', update: { type: 'resources', resources } });
      return controller;
    })
  }, [resources])

  return useMemo(() => {
    if (!miniTheaterId || !connection || !controller)
      return null;

    const act = (action) => {
      console.log(`ACTION`, action);
      if (action.type === 'remote-action')
        connection.miniTheater.act(miniTheaterId, action.remoteAction);
      controller.act(action);
    }
    return {
      ...controller,
      act
    }
  }, [controller, connection, miniTheaterId])
};
