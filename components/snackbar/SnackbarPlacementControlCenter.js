// @flow strict
/*::
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "../miniTheater/useMiniTheaterController2";
import type { Component } from "@lukekaalim/act";
*/
/*::
export type SnackbarPlacementControlCenterProps = {
  state: MiniTheaterLocalState,
  controller: MiniTheaterController2,
};
*/

import { h } from "@lukekaalim/act";
import styles from './SnackbarControl.module.css';

export const SnackbarPlacementControlCenter/*: Component<SnackbarPlacementControlCenterProps>*/ = ({
  state,
  controller
}) => {
  const selectedLayer = state.miniTheater.layers.find(l => l.id === state.layer);

  if (!selectedLayer)
    return null;

  const placements = selectedLayer.includes.map(i => {
    switch (i.type) {
      case 'any':
      default:
        return [];
      case 'any-monsters':
        return [...state.resources.monsterMasks.values()]
          .map(monster => ({
            type: 'monster',
            monster,
            iconURL: monster.initiativeIconAssetId && state.resources.assets.get(monster.initiativeIconAssetId)?.downloadURL
          }))
      case 'characters':
        return [...state.resources.characters.values()]
          .map(character => ({
            type: 'character',
            character,
            iconURL: character.initiativeIconAssetId && state.resources.assets.get(character.initiativeIconAssetId)?.downloadURL
          }))
      case 'any-terrain':
        return [...state.resources.terrainProps.values()]
          .map(terrain => ({ type: 'terrain', terrain }))
    }
  }).flat(1)

  const onPlacementClick = (placement) => () => {
    controller.act({ type: 'select', selection: { type: 'placement', placement } })
  }

  return [
    placements.map((placement) => {
      switch (placement.type) {
        case 'terrain':
          const terrainSelected =
            state.selection.type === 'placement'
            && state.selection.placement.type === 'terrain'
            && state.selection.placement.terrain === placement.terrain.id;

          return h('button', {
            disabled: terrainSelected,
            onClick: onPlacementClick({ type: 'terrain', terrain: placement.terrain.id })
          }, placement.terrain.name)
        case 'monster':
          const monsterSelected =
            state.selection.type === 'placement'
            && state.selection.placement.type === 'piece'
            && state.selection.placement.represents.type === 'monster'
            && state.selection.placement.represents.monsterActorId === placement.monster.id;

          return h(PlacementButton, {
            onClick: onPlacementClick({ type: 'piece', represents: { type: 'monster', monsterActorId: placement.monster.id } }),
            name: placement.monster.name,
            iconURL: placement.iconURL
          });
        case 'character':
          const characterSelected =
            state.selection.type === 'placement'
            && state.selection.placement.type === 'piece'
            && state.selection.placement.represents.type === 'character'
            && state.selection.placement.represents.characterId === placement.character.id

          return h(PlacementButton, {
            selected: characterSelected,
            onClick: onPlacementClick({ type: 'piece', represents: { type: 'character', characterId: placement.character.id } }),
            name: placement.character.name,
            iconURL: placement.iconURL
          });
        default:
          return null
      }
    })
  ];
}

const PlacementButton = ({ onClick, iconURL, name }) => {
  return h('button', {
    class: styles.placementButton,
    onClick,
  }, [
    h('img', { class: styles.placementButtonIcon, src: iconURL }),
    h('div', { class: styles.placementButtonText }, name),
  ])
}