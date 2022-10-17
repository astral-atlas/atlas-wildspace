// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type {
  Vector3D, BoxBoardArea, Piece,
  BoardPosition,
  Character,
  MonsterActorMask,
  AssetID,
} from "@astral-atlas/wildspace-models";

import type { MiniTheaterController } from "./useMiniTheaterController";
import type { AssetDownloadURLMap } from "../asset/map";
import type { SwampResources } from "../encounter/useSwampResources";
import type { MiniTheaterRenderResources } from "./useMiniTheaterResources";
*/

import {
  BoxGeometry,
  Color,
  MeshBasicMaterial,
  SpriteMaterial,
  TextureLoader,
  Vector2,
  Vector3,
  sRGBEncoding,
} from "three";
import { h, useEffect, useRef, useState } from "@lukekaalim/act";

import { maxSpan, useTimeSpan, useAnimatedNumber, calculateSpanProgress } from "@lukekaalim/act-curve";
import { group, mesh, sprite, useDisposable } from "@lukekaalim/act-three";

import { isBoardPositionEqual } from "@astral-atlas/wildspace-models";

import { calculateBezier2DPoint, useAnimatedVector2 } from "../animation/2d";
import { calculateCubicBezierAnimationPoint } from "@lukekaalim/act-curve/bezier";
import { useAnimatedVector3 } from "../animation";
import { MiniTheaterSprite } from "./MiniTheaterSprite";
import { Object3DDuplicate } from "../three/Object3DDuplicate";
import styles from './MiniTheaterPieceRenderer.module.css';


export const getPieceAssetId = (
  represents/*: Piece["represents"]*/,
  resources/*: MiniTheaterRenderResources*/,
)/*: ?AssetID*/ => {
  switch (represents.type) {
    case 'character':
      const character = resources.characters.get(represents.characterId)
      if (!character)
        return null;
      return character.initiativeIconAssetId;
    case 'monster':
      const monster = resources.monsterMasks.get(represents.monsterActorId);
      if (!monster)
        return null;
      return monster.initiativeIconAssetId;
    default:
      return null;
  }
}

const usePieceTexture = (piece, resources) => {
  const material = useDisposable(() => {
    return new SpriteMaterial()
  }, [])
  const assetId = getPieceAssetId(piece.represents, resources)
  useEffect(() => {
    const info = !!assetId && resources.assets.get(assetId);
    if (!info)
      return;
    
    const texture = new TextureLoader().load(info.downloadURL);
    texture.encoding = sRGBEncoding;
    material.map = texture;

    return () => {
      texture.dispose();
    }
  }, [assetId]);
  return material;
}

const MiniPieceRenderer = ({
  controller,
  resources,
  piece,
}) => {
  const material = usePieceTexture(piece, resources)

  const [selected, setSelected] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!controller)
      return;
    const unsubscribeSelection = controller.subscribeSelection((selection) => {
      setSelected(!!selection && selection.pieceRef === piece.id)
    })
    const unsubscribeCursor = controller.subscribeCursor((cursor) => {
      setHover(!!cursor && isBoardPositionEqual(cursor.position, piece.position))
    })
    return () => {
      unsubscribeSelection();
      unsubscribeCursor();
    }
  }, [piece, controller])

  return h(MiniTheaterSprite, { position: piece.position, hover, selected, material })
};

const Box = ({ position, controller, piece }) => {
  const geometry = useDisposable(() => new BoxGeometry(30, 9, 30), []);
  const material = useDisposable(() => new MeshBasicMaterial({ color: new Color('#3b6a5b') }), []);

  const [selected, setSelected] = useState(false);
  useEffect(() => {
    if (!controller)
      return;
    return controller.subscribeSelection(event => setSelected(!!event && event.pieceRef === piece.id))
  }, [controller]);

  return h(mesh, {
    geometry,
    material,
    position: new Vector3(position.x * 10, (position.z * 10) + 5, position.y * 10)
  }, [
    h('css2dObject', {}, h('button', { className: styles.selectionButton, onClick: () => controller && controller.selectPiece(piece.id) }, 'Select'))
  ]);
};

const SwampTerrain = ({ piece, controller, position, swampObject, swampResources }) => {
  const swampMaterial = useDisposable(() => new MeshBasicMaterial({ map: swampResources.swampTexture }), [swampResources]);
  const context = {
    materials: new Map([
      ['SwampResources', swampMaterial]
    ]),
  };

  return h(group, { position: new Vector3(position.x * 10, position.z * 10, position.y * 10) }, [

    h(Object3DDuplicate, { target: swampObject, context }),
    h('css2dObject', {}, h('button', { className: styles.selectionButton, onClick: () => controller && controller.selectPiece(piece.id) }, 'Select'))
  ]);
}


const TerrainPieceRenderer = ({ piece, represents, controller, resources }) => {
  return null;
  /*
  const swampObject = swampResources.swampModel.children.find(c => c.name === represents.terrainType);
  if (swampObject)
    return h(SwampTerrain, { swampObject, controller, piece, swampResources, position: piece.position })
  
  switch (represents.terrainType) {
    case 'box':
      return h(Box, { position: piece.position, piece, controller });
    default:
      return null;
  }
  */
};


/*::
export type MiniTheaterPieceRendererProps = {
  controller: ?MiniTheaterController,
  resources: MiniTheaterRenderResources,
  piece: Piece,
};
*/

export const MiniTheaterPieceRenderer/*: Component<MiniTheaterPieceRendererProps>*/ = ({
  controller,
  resources,
  piece,
}) => {
  const { represents } = piece;
  switch (represents.type) {
    case 'character':
    case 'monster':
      return h(MiniPieceRenderer, { controller, resources, piece });
    default:
      return null;
  }
};