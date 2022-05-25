// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
*/

import { h, useState } from "@lukekaalim/act";
import { EncounterSceneRenderer } from "@astral-atlas/wildspace-components";
import { createMockCharacter, createMockImageAsset } from "@astral-atlas/wildspace-test";

const beastIcon = createMockImageAsset();

export const EncounterSceneDemo/*: Component<>*/ = () => {
  const assets = new Map([
    [beastIcon.description.id, beastIcon]
  ]);

  const characters = [
    createMockCharacter(),
    createMockCharacter(),
  ];
  const [miniPosition, setMiniPosition] = useState({ x: 0, y: 0, z: 0 });
  const encounterState = {
    encounterId: '0',

    round: 0,
    turnIndex: 0,
    turnOrder: [

    ],
    minis: [
      {
        type: 'monster',
        monsterId: 'MONSTER_AA',
        visible: true,
        iconAssetId: beastIcon.description.id,
        conditions: [],
        hitpoints: 100,
        id: "MONSTER_A",
        maxHitpoints: 100,
        name: "BEATSTMAN",
        position: miniPosition,
        tempHitpoints: 0
      }
    ],
  }
  const gameId = 'GAME_0';
  const roomId = 'ROOM_0';
  const client/*: any*/ = {
    room: {
      performEncounterActions: async (gameId, roomId, actions) => {
        const handleAction = (action) => {
          switch (action.type) {
            case 'move':
              return setMiniPosition(action.newPosition);
          }
        };
        for (const action of actions)
          handleAction(action);
      }
    }
  };

  return [
    h(EncounterSceneRenderer, {
      gameId,
      roomId,
      client,
      assets,
      characters,
      encounterState
    })
  ];
}
