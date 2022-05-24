// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { Board, BoxBoardArea } from "@astral-atlas/wildspace-models";
import type { Mesh } from "three";
*/
import { useDisposable } from "@lukekaalim/act-three";
import { h } from "@lukekaalim/act";
import { Color, LinearFilter, TextureLoader, Vector2, Vector3 } from "three";

import { Tilemap, TilemapTile2DTexture } from "./Tilemap";
import board_grid_tilemap from './board_grid_tilemap.png';
import cornersURL from './tilemap_corners.png';
import { isPointInsideBoardBox, isPointOnBoardFloor } from "@astral-atlas/wildspace-models";

const tilesTexture = new TextureLoader().load(board_grid_tilemap);
tilesTexture.minFilter = LinearFilter;
const tileSize = new Vector2(8, 8);
const redColor = new Color('red')

/*::
export type BoardLineGridProps = {
  board: Board,
  boardBox: BoxBoardArea,
  ref?: Ref<?Mesh>,
};
*/

export const BoardLineGrid/*: Component<BoardLineGridProps>*/ = ({
  board,
  boardBox,
  ref,
}) => {
  const mapTexture = useDisposable(() => {
    const data = new Uint8Array(boardBox.size.x * boardBox.size.y * 4);
    for (let x = 0; x < boardBox.size.x; x++) {
      for (let y = 0; y < boardBox.size.y; y++) {
        const i = (x * boardBox.size.y * 4) + (y * 4);
        const localX = x - Math.floor(boardBox.size.x/2);
        const localY = y - Math.floor(boardBox.size.y/2)
        const isFloor = isPointOnBoardFloor({ x: localX, y: localY, z: 0 }, board);

        data[i+0] = isFloor ? 0 : 8;
        data[i+1] = isFloor ? 0 : 0;
        data[i+2] = 1;
        data[i+3] = 1;
      }
    }
    
    return new TilemapTile2DTexture(data, new Vector2(boardBox.size.x, boardBox.size.y));
  }, [boardBox.size.x, boardBox.size.y]);

  return h(Tilemap, {
    ref,
    mapTexture,
    tileSize,
    scale: 10,
    tilesTexture,
    opacity: 0.5,
  });
}