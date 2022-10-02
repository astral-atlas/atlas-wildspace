// @flow strict

import { h } from "@lukekaalim/act"
import styles from './miniTheater.module.css';
import { EditorForm, SelectEditor } from "../../editor/form";
import { v4 } from "uuid";``

/*::
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "../../miniTheater/useMiniTheaterController2";
import type { Component } from "@lukekaalim/act/component";

export type MiniTheaterControlsProps = {
  controller: MiniTheaterController2,
  state: MiniTheaterLocalState,
}
*/

const getRepresentation = (represents, resources) => {
  switch (represents.type) {
    case 'character':
      return resources.characters.get(represents.characterId);
    case 'monster':
      return resources.monsterMasks.get(represents.monsterActorId);
  }
}

export const MiniTheaterControls/*: Component<MiniTheaterControlsProps>*/ = ({
  controller,
  state,
}) => {
  const { resources, selection, miniTheater, targetMode } = state;
  const { terrain } = miniTheater;

  const onCharacterClick = (character) => () => {
    const placement = {
      type: 'piece',
      represents: { type: 'character', characterId: character.id }
    }
    controller.act({ type: 'select', selection: { type: 'placement', placement } })
  };
  const onMonsterMaskClick = (monster) => () => {
    const placement = {
      type: 'piece',
      represents: { type: 'monster', monsterActorId: monster.id }
    }
    controller.act({ type: 'select', selection: { type: 'placement', placement } })
  }
  const onTerrainPropClick = (terrainProp) => () => {
    const terrainPlacement = {
      id: v4(),
      layer: '',
      position: { x: 0, y: 0, z: 0 },
      quaternion: { x: 0, y: 0, z: 0, w: 1 },
      terrainPropId: terrainProp.id,
    };
    controller.act({
      type: 'remote-action',
      remoteAction: { type: 'set-terrain', terrain: [...terrain, terrainPlacement] }
    })
  }
  const onRemovePieceClick = (piece) => () => {
    controller.act({
      type: 'remote-action',
      remoteAction: { type: 'remove-piece', removedPiece: piece.id }
    })
  }
  const onRemoveTerrainClick = (terrainPlacement) => () => {
    controller.act({
      type: 'remote-action',
      remoteAction: { type: 'set-terrain', terrain: terrain.filter(t =>
        t.id !== terrainPlacement.id) }
    })
  }
  const onDeselectClick = () => {
    controller.act({
      type: 'select',
      selection: { type: 'none' }
    })
  }
  const onTargetModeChange = (targetMode) => {
    if (targetMode !== 'pieces' && targetMode !== 'terrain')
      return;
    controller.act({ type: 'set-target-mode', targetMode });
  };

  const selectedPiece = selection.type === 'piece' && miniTheater.pieces.find(p =>
    p.id === selection.pieceId) || null;
  const selectedTerrain = selection.type === 'terrain-prop' && miniTheater.terrain.find(t =>
    t.id === selection.terrainId) || null

  return h('div', { class: styles.controlsAnchor }, [
    h('div', { class: styles.controls }, [
      h(EditorForm, {}, [
        h(SelectEditor, {
          values: [{ value: 'terrain' }, { value: 'pieces' }],
          selected: state.targetMode,
          onSelectedChange: onTargetModeChange
        })
      ]),

      selectedTerrain && [
        h('button', {
          classList: [styles.controlButton, styles.special],
          onClick: onRemoveTerrainClick(selectedTerrain)
        }, 'Remove'),

        h('button', {
          classList: [styles.controlButton, styles.special],
          onClick: onDeselectClick
        }, 'Deselect')
      ],

      selectedPiece && [
        h('button', {
          classList: [styles.controlButton, styles.special],
          onClick: onRemovePieceClick(selectedPiece)
        }, 'Remove')
      ],

      selection.type === 'none' && [
        targetMode === 'pieces' && [
          [...resources.characters.values()]
            .map(c => {
              return h('button', {
                class: styles.controlButton,
                onClick: onCharacterClick(c)
              }, c.name)
            }),
          state.isGM &&
          [...resources.monsterMasks.values()]
            .map(m => {
              return h('button', {
                classList: [styles.controlButton, styles.special],
                onClick: onMonsterMaskClick(m)
              }, m.name)
            })
        ],
        targetMode === 'terrain' && [
          [...resources.terrainProps.values()]
            .map(p => {
              return h('button', {
                class: styles.controlButton,
                onClick: onTerrainPropClick(p)
              }, p.name)
            }),
        ]
      ]
    ])
  ]);
}