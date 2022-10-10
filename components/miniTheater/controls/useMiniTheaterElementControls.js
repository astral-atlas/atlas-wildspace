// @flow strict
/*::
import type { ReadOnlyRef } from "../../three";
import type { MiniTheaterController2 } from "../useMiniTheaterController2";
*/

import { isBoardPositionEqual } from "@astral-atlas/wildspace-models";
import { useEffect } from "@lukekaalim/act"

import { v4 } from "uuid";

export const useMiniTheaterElementControls = (
  surfaceRef/*: ReadOnlyRef<?HTMLElement>*/,
  controller/*: ?MiniTheaterController2*/
) => {
  useEffect(() => {
    const { current: surface } = surfaceRef;
    if (!surface || !controller)
      return;

    const getActionForPlacementRightClick = (placement, cursor, state) => {
      const { layer, miniTheater } = state;
      if (!layer)
        return;
      switch (placement.type) {
        case 'piece':
          return { type: 'remote-action', remoteAction: {
            type: 'place-piece',
            position: cursor,
            layer,
            pieceRepresents: placement.represents,
          } }
        case 'terrain':
          const terrainPropId = placement.terrain;
          const nextTerrain = {
            terrainPropId,
            id: v4(),
            layer,
            position: { x: cursor.x * 10, y: cursor.z * 10, z: cursor.y * 10 },
            quaternion: { x: 0, y: 0, z: 0, w: 1 },
          };
          return {
            type: 'remote-action', remoteAction: {
              type: 'set-terrain',
              terrain: [...miniTheater.terrain, nextTerrain]
            }
          };
        default:
          return;
      }
    }

    const getActionForRightClick = (state) => {
      const {
        cursor, selection, tool, miniTheater,
      } = state;
      if (!cursor)
        return null;
      switch (selection.type) {
        case 'terrain-prop':
          if (tool.type !== 'place')
            return null;
          const { terrainId } = selection;
          return { type: 'remote-action', remoteAction: {
              type: 'set-terrain',
              terrain: miniTheater.terrain.map(t => t.id === terrainId
                ? { ...t, position: { x: cursor.x * 10, y: cursor.z * 10, z: cursor.y * 10 } }
                : t)
            }
          }
        case 'piece':
          return { type: 'remote-action', remoteAction: {
              type: 'move-piece',
              movedPiece: selection.pieceId,
              position: cursor
            }
          };
        case 'placement':
          return getActionForPlacementRightClick(selection.placement, cursor, state);
      }
    }
    const getActionForLeftClick = (state) => {
      const { cursor, terrainCursor, miniTheater, selection } = state;
      const selectedPiece = cursor && miniTheater
        .pieces
        .find(p => isBoardPositionEqual(p.position, cursor) && p.layer === state.layer);
      const selectedTerrain = terrainCursor && miniTheater
        .terrain
        .find(t => t.id === terrainCursor) || null;

      if (selectedPiece) 
        return ({ type: 'select', selection: { type: 'piece', pieceId: selectedPiece.id } })
      
      if (selectedTerrain)
        return ({ type: 'select', selection: { type: 'terrain-prop', terrainId: selectedTerrain.id } })
      
      if (selection.type === 'terrain-prop')
        return;
        
      return ({ type: 'select', selection: { type: 'none' } });
    }

    const onContextMenu = (event/*: MouseEvent*/) => {
      event.preventDefault();
      const state = controller.getState();
      const action = getActionForRightClick(state);
      if (action)
        controller.act(action);
    }
    const onClick = (event/*: MouseEvent*/) => {
      const state = controller.getState();
      const action = getActionForLeftClick(state);
      if (action)
        controller.act(action);
    }
    surface.addEventListener('contextmenu', onContextMenu);
    surface.addEventListener('click', onClick);

    return () => {
      surface.removeEventListener('contextmenu', onContextMenu);
      surface.removeEventListener('click', onClick);
    }
  }, []);
}