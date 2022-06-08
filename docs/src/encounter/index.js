// @flow strict
/*::
import type { Page } from "..";

import type { LibraryData } from "@astral-atlas/wildspace-models";
*/

import { h, useEffect, useMemo, useState } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import encounterText from './index.md?raw';
import { EncounterBoardPiece, useElementKeyboard, useEncounterController, useKeyboardTrack, useRenderSetup } from "@astral-atlas/wildspace-components";
import { ScaledLayoutDemo } from "../demo";
import { perspectiveCamera, scene } from '@lukekaalim/act-three';
import { Box2, Vector2 } from "three";
import { EncounterBoard } from '@astral-atlas/wildspace-components/encounter/EncounterBoard';
import { calculateBoardBox, createMaskForMonsterActor, reduceEncounterState, reduceMiniTheaterAction } from '@astral-atlas/wildspace-models';
import { createMockAssetsForLibrary, createMockCharacter, createMockGame, createMockLibraryData, createMockMonsterMini, randomGameName } from '@astral-atlas/wildspace-test';
import { resourcesContext, useResourcesLoader } from '@astral-atlas/wildspace-components/encounter/useResources';
import { MiniTheaterCanvas } from '@astral-atlas/wildspace-components';
import { useMiniTheaterController } from '@astral-atlas/wildspace-components/miniTheater/useMiniTheaterController';
import { GridHelperGroup } from "../controls/helpers";
import { MiniTheaterOverlay } from '@astral-atlas/wildspace-components/miniTheater/MiniTheaterOverlay';

const board = {
  id: 'BOARD_0',
  floors: [
    { type: 'box', box: { position: { x: 0, y: 0, z: 0 }, size: { x: 12, y: 24, z: 1 } } },
    //{ type: 'box', box: { position: { x: 2, y: 2, z: 3 }, size: { x: 2, y: 2, z: 2 } } },
    //{ type: 'box', box: { position: { x: 0, y: 0, z: 5 }, size: { x: 1, y: 3, z: 1 } } },
  ]
};

const EncounterDemo = () => {
  const controller = useMiniTheaterController()
  
  const [data, setData] = useState/*:: <LibraryData>*/(createMockLibraryData());
  const assets = new Map(createMockAssetsForLibrary(data).map(a => [a.description.id, a]));

  const applyActionToTheater = (action) => {
    setData(d => ({
      ...d,
      miniTheaters: [reduceMiniTheaterAction(d.miniTheaters[0], action)]
    }))
  }

  useEffect(() => controller.subscribeAction(applyActionToTheater), [])

  const { characters, monsters, monsterActors, miniTheaters } = data;

  const resources = useResourcesLoader()

  return h(ScaledLayoutDemo, {}, [
    h(MiniTheaterOverlay, { characters, monsterActors, controller, assets }),
    h(MiniTheaterCanvas, {
      assets,
      controller,
      characters,
      miniTheater: miniTheaters[0],
      monsters: monsterActors.map(actor => {
        const monster = monsters.find(m => m.id === actor.monsterId );
        if (!monster)
          return null;
        return createMaskForMonsterActor(monster, actor)
      }).filter(Boolean),
      resources
    })
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
