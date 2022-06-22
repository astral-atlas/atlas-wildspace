// @flow strict
/*::
import type { MonsterActor,Character } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";

import type { MiniTheaterController } from "./useMiniTheaterController";
import type { AssetDownloadURLMap } from "../asset/map";
*/

import { CornersLayout } from "../layout/CornersLayout";
import { h } from "@lukekaalim/act"

import classes from './MiniTheaterOverlay.module.css';
import { ToolbarPalette } from "../toolbar";
/*::
export type MiniTheaterOverlayProps = {
  assets: AssetDownloadURLMap,

  controller: MiniTheaterController,
  characters: $ReadOnlyArray<Character>,
  monsterActors: $ReadOnlyArray<MonsterActor>,
};
*/
export const MiniTheaterOverlay/*: Component<MiniTheaterOverlayProps>*/ = ({
  assets,

  characters,
  monsterActors,
  controller
}) => {
  const onCharacterClick = (character) => () => {
    controller.pickPlacement({ type: 'character', characterId: character.id })
  }
  const onMonsterActorClick = (monsterActor) => () => {
    controller.pickPlacement({ type: 'monster', monsterActorId: monsterActor.id })
  }
  const tools = [
    ...characters.map(c => ({
      onClick: onCharacterClick(c),
      iconURL: !!c.initiativeIconAssetId && assets.get(c.initiativeIconAssetId)?.downloadURL || ''
    }))
  ]

  return h(CornersLayout, {
    bottom: h('div', { style: { width: '100%' } },
      h(ToolbarPalette, { tools: [] }))
  })
}