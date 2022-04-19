// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { CharacterID } from '@astral-atlas/wildspace-models'; */
import { h, useState, useEffect, useMemo } from '@lukekaalim/act';
import { C } from '@lukekaalim/act-three';

import { renderAppPage, renderDocument } from "../app.js";
import { CopperButton, FeatureSection, SmallTextInput } from '../components/5e.js';
import { useAPI, useGame } from "../hooks/api.js";
import { useAsync } from '../hooks/async.js';
import { useIdentity } from '../hooks/identity.js';
import { BackgroundBox } from "../components/5e";

import styles from './characters.module.css';
import { WildspaceHeader } from '../components/Header.js';
import { StarfieldScene } from './starfieldScene.js';
import { useURLParam } from '../hooks/navigation.js';
import { useConnection } from "../hooks/connect";
import { CharacterSheet } from './CharacterSheet.js';
import { WildspaceApp } from "../app";
import { useWildspaceState } from '../hooks/app.js';
import { CharacterSheet2 } from "./CharacterSheet2.js";

const CharacterPreview = ({ character }) => {
  return [
    h(BackgroundBox, {}, h(FeatureSection, { contentClassName: styles.characterSheet }, [
      h('section', {}, [
        h(SmallTextInput, { label: `Name`, value: character.name, disabled: true }),
      ])
    ])),
  ];
};

const NewCharacterEditor = ({ game, identity, player }) => {
  const api = useAPI();
  const [characterName, setCharacterName] = useState('');
  const [_, setSelectedCharacterId] = useURLParam('characterId');

  const onSubmit = async (e) => {
    e.preventDefault();
    const character = await api.game.character.create(game.id, characterName, player.userId)
    setSelectedCharacterId(character.id);
  }

  return [
    h(BackgroundBox, {}, h(FeatureSection, { contentClassName: styles.characterSheet }, [
      h('form', { onSubmit }, [
        h('label', { class: styles.characterSheetNameLabel }, [
          h(SmallTextInput, {
            label: `Enter you Character's Name`, value: characterName,
            onChange: v => setCharacterName(v), placeholder: `e.g. Torpus the Glib`,
          }),
        ]),
        h('div', { className: styles.characteSheetActions }, [
          h(CopperButton, { type: 'submit' }, 'Create New Character')
        ]),
      ])
    ])),
  ];
};

const CharacterSelector = ({ game, gameData }) => {
  const api = useAPI();
  const { proof: { userId } } = useWildspaceState();
  const { characters, players } = gameData;

  const [playerId, setPlayerId] = useURLParam('playerId');
  const [characterId, setCharacterId] = useURLParam('characterId');

  const isGameMaster = game.gameMasterId === userId;

  const player = players.find(p => p.userId === playerId) || null;
  const character = characters.find(c => c.id === characterId) || null;

  const visiblePlayers = isGameMaster ? players : players.filter(p => p.userId == userId || characters.find(c => c.playerId === p.userId)) || null;
  const visibleCharacters = playerId && characters.filter(c => c.playerId === playerId) || null;


  return [
    h('nav', { className: styles.charactersPageNavigation }, [
      h(TabList, {
        options: visiblePlayers.map(p => p.userId),
        getLabel: id => players.find(p => p.userId === id)?.name || '',
        value: playerId || '',
        onChange: (id) => {
          setPlayerId(id || null);
          const firstCharacter = characters.find(c => c.playerId === id)
          setCharacterId(firstCharacter ? firstCharacter.id : null)
        },
      }),
      !visibleCharacters && h('p', {}, `Select a Player to view their characters`),
      visibleCharacters && [
        player && h('button', { onClick: () => api.game.character.create(game.id, '', player.userId) }, 'Create Character'),
        h(TabList, {
          options: visibleCharacters.map(c => c.id),
          getLabel: id => characters.find(p => p.id === id)?.name || '<Unnamed Character>',
          value: characterId || '',
          onChange: (id) => {
            setCharacterId(id);
          },
        }),
      ]
    ]),
    character && player && h('div', { className: styles.charactersPageSheetWorkspace }, [
      h('div', { className: styles.charactersPageSheetContainer },
        h(CharacterSheet2, { character, player, game, gameData, disabled: !isGameMaster && player.userId !== userId  })),
    ]),
  ];
};

/*::
export type TabListProps = {
  options: string[],
  value: string,
  onChange: string => mixed,
  getLabel?: string => string,
}
*/

const TabList/*: Component<TabListProps>*/ = ({ options, value, onChange, getLabel = a => a }) => {
  const getClassName = (option) => {
    return [
      styles.tabsListOption,
      option === value ? styles.tabsListOptionSelected : null
    ]
      .filter(Boolean)
      .join(' ');
  }

  return [
    h('ul', { class: styles.tabsList }, [
      options.map(option =>
        h('li', {},
          h('button', { className: getClassName(option), onClick: () => onChange(option) }, getLabel(option)))),
    ])
  ];
};

const CharacterManagementPage = () => {
  const api = useAPI();
  const [games] = useAsync(() => api.game.list(), [api])
  const [gameId, setGameId] = useURLParam('gameId');
  const gameData = useGame(gameId);

  if (!games)
    return null;

  const selectedGame = games.find(g => g.id === gameId) || null;
  
  return [
    h(WildspaceHeader, {
      left: [
        h('div', { style: { display: 'flex', flexDirection: 'column' }}, [
          h('select', { value: gameId || '', onChange: e => setGameId(e.target.value || null) }, [
            h('option', { selected: !gameId, value: '' }, '<No Game>'),
            games.map(g => h('option', { value: g.id, selected: g.id === gameId }, g.name)),
          ]),
        ])
      ]
    }),
    h('div', { class: styles.characterPage }, [
      h('div', { class: styles.characterPageBackground }, [
        h(StarfieldScene),
      ]),
      h('div', { class: styles.characterPageContent }, [
        !selectedGame && [
          h('h2', {}, 'No Game Selected'),
          h('p', {}, 'Select a Game to begin')
        ],
        selectedGame && h(CharacterSelector, { game: selectedGame, gameData }),
      ]),
    ]),
  ];
};

renderDocument(h(WildspaceApp, { initialURL: new URL(document.location.href) }, h(CharacterManagementPage)));