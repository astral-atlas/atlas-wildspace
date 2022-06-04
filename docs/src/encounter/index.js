// @flow strict
/*::
import type { Page } from "..";

import type { EncounterState } from "@astral-atlas/wildspace-models";
*/

import { h, useEffect, useMemo, useState } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import encounterText from './index.md?raw';
import { EncounterBoardPiece, useElementKeyboard, useEncounterController, useKeyboardTrack, useRenderSetup } from "@astral-atlas/wildspace-components";
import { ScaledLayoutDemo } from "../demo";
import { perspectiveCamera, scene } from '@lukekaalim/act-three';
import { Box2, Vector2 } from "three";
import { EncounterBoard } from '@astral-atlas/wildspace-components/encounter/EncounterBoard';
import { calculateBoardBox, reduceEncounterState } from '@astral-atlas/wildspace-models';
import { createMockCharacter, createMockGame, createMockMonsterMini, randomGameName } from '@astral-atlas/wildspace-test';
import { resourcesContext, useResourcesLoader } from '@astral-atlas/wildspace-components/encounter/useResources';
import { MiniTheaterRenderer } from '@astral-atlas/wildspace-components/miniTheater/MiniTheaterRenderer';
import { useMiniTheaterController } from '@astral-atlas/wildspace-components/miniTheater/useMiniTheaterController';
import { GridHelperGroup } from "../controls/helpers";

const board = {
  id: 'BOARD_0',
  floors: [
    { type: 'box', box: { position: { x: 0, y: 0, z: 0 }, size: { x: 12, y: 24, z: 1 } } },
    //{ type: 'box', box: { position: { x: 2, y: 2, z: 3 }, size: { x: 2, y: 2, z: 2 } } },
    //{ type: 'box', box: { position: { x: 0, y: 0, z: 5 }, size: { x: 1, y: 3, z: 1 } } },
  ]
};

const EncounterDemo = () => {
  const { canvasRef, cameraRef, sceneRef, loop } = useRenderSetup();

  const characters = [
    createMockCharacter()
  ];
  const [encounter, setEncounter] = useState/*:: <EncounterState>*/({
    encounterId: 'ENCOUNTER_0',

    minis: [
      createMockMonsterMini(),
      createMockMonsterMini(),
      createMockMonsterMini(),
    ],
    round: 0,
    turnIndex: 0,
    turnOrder: [],
  });
  const updateEncounter = (action) => {
    setEncounter(encounter => 
      reduceEncounterState(encounter, characters, action)
    );
  }

  const boards = [
    board,
  ];
  const pieces = [
    ...encounter.minis.map(mini => ({
      id: mini.id,
      boardId: board.id,
      area: { type: 'box', box: {
        position: mini.position,
        size: { x: 1, y: 1, z: 1 },
      }}
    })),
  ];
  const emitter = useElementKeyboard(canvasRef);
  const keyboard = useKeyboardTrack(emitter);
  const boardBox = calculateBoardBox(board);
  const cameraBounds = new Box2(
    new Vector2(-boardBox.size.x, boardBox.size.x).multiplyScalar(10),
    new Vector2(boardBox.size.y, -boardBox.size.y).multiplyScalar(10)
  )

  const encounterController = useEncounterController({
    cameraRef,
    canvasRef,
    keyboard,
    boards,
    pieces,
    cameraBounds,
    loop
  });
  
  useEffect(() => {
    return encounterController.subscribePieceMove((event) => {
      updateEncounter({ type: 'move', miniId: event.pieceId, newPosition: event.position })
    })
  }, [])

  const resources = useResourcesLoader()
  const controller = useMiniTheaterController();
  const miniTheaterView = {
    characterPieces: [],
    monsterPieces: [],
    miniTheater: { characterPieceIds: [], id: 'MINI_THEATER', monsterPieceIds: [], name: randomGameName() },
  }
  const assets = new Map();
  const monsterMasks = [];

  return h(ScaledLayoutDemo, {}, [
    h(MiniTheaterRenderer, { assets, board, characters, controller, miniTheaterView, monsterMasks, resources }, [
    ]),
  ])
}

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'encounter':
      return h(EncounterDemo)
    default:
      return null;
  }
}

export const encounterPage/*: Page*/ = {
  link: {
    href: '/encounter',
    children: [],
    name: "Encounter"
  },
  content: h(Document, {}, h(Markdown, { text: encounterText, directives: { demo: Demo }}))
};

export const encounterPages = [
  encounterPage,
];
