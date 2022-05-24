// @flow strict
/*::
import type { BufferGeometry } from "three";
import type { Board, BoxBoardArea } from "@astral-atlas/wildspace-models";
*/
import { useEffect, useState } from "@lukekaalim/act";
import { useDisposable } from "@lukekaalim/act-three";

import { PlaneGeometry } from "three";


export const useBoardBoxGeometry = (boardBox/*: BoxBoardArea*/)/*: BufferGeometry*/ => {
  const width = 10 * boardBox.size.x;
  const height = 10 * boardBox.size.y;
  
  const geometry = useDisposable(
    () => new PlaneGeometry(width, height, 1, 1)
      .rotateX(Math.PI*-0.5)
      .translate((boardBox.size.x % 2) * -5, 0, (boardBox.size.y % 2) * -5),
    [height, width]
  );

  return geometry;
}