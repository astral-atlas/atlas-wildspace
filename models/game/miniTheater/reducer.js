// @flow strict

/*::
import type { MiniTheater } from "./miniTheater";
import type { MiniTheaterAction } from "./action";
import type { MiniTheaterEvent } from "./events";
*/
import { v4 } from "uuid";

export const reduceMiniTheaterAction = (
  action/*: MiniTheaterAction*/,
  miniTheater/*: MiniTheater*/
)/*: MiniTheater*/ => {
  switch (action.type) {
    case 'move-piece':
      return {
        ...miniTheater,
        pieces: miniTheater.pieces.map(p => {
          if (p.id !== action.movedPiece)
            return p;
          return {
            ...p,
            position: action.position
          };
        })
      }
    case 'place-piece':
      return {
        ...miniTheater,
        pieces: [...miniTheater.pieces,
          {
            id: v4(),
            visible: true,
            layer: action.layer,
            represents: action.pieceRepresents,
            position: action.position
          }
        ],
      }
    case 'remove-piece':
      return {
        ...miniTheater,
        pieces: miniTheater.pieces.filter(p =>
          p.id !== action.removedPiece),
      };
    case 'set-terrain':
      return {
        ...miniTheater,
        terrain: action.terrain,
      }
    case 'set-layers':
      return {
        ...miniTheater,
        layers: action.layers,
      }
    default:
      return miniTheater;
  }
};

export const reduceMiniTheaterEvent = (
  event/*: MiniTheaterEvent*/,
  miniTheater/*: MiniTheater*/
)/*: MiniTheater*/ => {
  switch (event.type) {
    case 'update':
      return event.next;
    case 'update-pieces':
      return {
        ...miniTheater,
        pieces: event.pieces,
        version: event.version,
      };
    default:
      return miniTheater;
  }
};