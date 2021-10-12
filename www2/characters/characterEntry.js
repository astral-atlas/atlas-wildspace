// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { CharacterID } from '@astral-atlas/wildspace-models'; */
import { h, useState, useEffect, useMemo } from '@lukekaalim/act';
import { C } from '@lukekaalim/act-three';

import { renderAppPage } from "../app.js";
import { CopperButton, FeatureSection, SmallTextInput } from '../components/5e.js';
import { useAPI } from "../hooks/api.js";
import { useAsync } from '../hooks/async.js';
import { useIdentity } from '../hooks/identity.js';
import { BackgroundBox } from "../components/5e";

import styles from './characters.module.css';
import { WildspaceHeader } from '../components/Header.js';
import { StarfieldScene } from './starfieldScene.js';
import { useNavigation, useURLParam } from '../hooks/navigation.js';
import { useConnection } from "../hooks/connect";
import { CharacterSheet } from './CharacterSheet.js';

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

const CharacterSelector = ({ game }) => {
  const api = useAPI();
  const [identity] = useIdentity();
  const [characters] = useAsync(() => api.game.character.list(game.id), [game, api]);
  const [players] = useAsync(() => api.game.players.list(game.id), [game, api]);

  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedCharacterId, setSelectedCharacterId] = useURLParam('characterId');

  if (!characters || !players || !identity)
    return null;

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || null;
  const selectedPlayer = players.find(p => p.userId === (selectedPlayerId || (selectedCharacter && selectedCharacter.playerId))) || null;

  const isGameMaster = game.gameMasterId === identity.proof.userId;
  const isSelectedPlayerMe = selectedPlayer && (identity.proof.userId === selectedPlayer.userId);
  const isPlayerEditable = (isGameMaster || isSelectedPlayerMe);

  const ownsNoCharacters = isSelectedPlayerMe && selectedPlayer && (characters.filter(c => c.playerId === selectedPlayer.userId).length < 1)

  return [
    h('nav', { className: styles.charactersPageNavigation }, [
      h(TabList, {
        options: players
          .filter(p => (characters.filter(c => c.playerId === p.userId).length > 0) || isGameMaster || p.userId === identity.proof.userId)
          .map(p => ({ label: identity.proof.userId === p.userId ? `${p.name} (Self)` :  p.name, value: p.userId })),
        selected: selectedPlayer && selectedPlayer.userId,
        onChange: (id) => {
          setSelectedPlayerId(id);
          const firstCharacter = characters.find(c => c.playerId === id)
          setSelectedCharacterId(firstCharacter ? firstCharacter.id : null)
        },
      }),
      !selectedPlayer && h('p', {}, `Select a Player to view their characters`),
      selectedPlayer && [
        ownsNoCharacters ? h('p', {}, `You don't have any characters at the moment. Create a new one to get started!`) : null,
        h(TabList, {
          options: [
            ...characters
              .filter(c => c.playerId === selectedPlayer.userId)
              .map(c => ({ label: c.name, value: c.id })),
            isPlayerEditable ? { value: null, label: '<New Character>' } : null
          ].filter(Boolean),
          selected: selectedCharacter && selectedCharacter.id,
          onChange: (v) => {
            setSelectedPlayerId(selectedPlayer.userId);
            setSelectedCharacterId(v || null);
          },
        }),
      ]
    ]),
    selectedPlayer && h('div', { className: styles.charactersPageSheetWorkspace }, [
      h('div', { className: styles.charactersPageSheetContainer }, [
        selectedCharacter && [
          isPlayerEditable && [
            h(CharacterSheet, { game, character: selectedCharacter, identity, player: selectedPlayer })
          ],
          !isPlayerEditable && [
            h(CharacterSheet, { game, character: selectedCharacter, identity, player: selectedPlayer, readOnly: true }),
          ],
        ],
        !selectedCharacter && isPlayerEditable && [
          h(NewCharacterEditor, { game, identity, player: selectedPlayer })
        ]
      ]),
    ]),
  ];
};

const TabList/*: Component<{ options: { value: ?string, label: string }[], selected: ?string, onChange: (v: ?string) => mixed}>*/ = ({ options, selected, onChange }) => {
  const getClassName = (option) => {
    return [
      styles.tabsListOption,
      option.value === selected ? styles.tabsListOptionSelected : null
    ]
      .filter(Boolean)
      .join(' ');
  }

  return [
    h('ul', { class: styles.tabsList }, [
      options.map(option =>
        h('li', {},
          h('button', { className: getClassName(option), onClick: () => onChange(option.value) }, option.label))),
    ])
  ];
};

const CharacterPage = ({ config }) => {
  const api = useAPI();
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [games] = useAsync(() => api.game.list(), [api, lastUpdated]);
  const url = new URL(window.location.href);
  const selectedGameId = url.searchParams.get('gameId');

  const selectedGame = games && games.find(game => game.id === selectedGameId) || null;

  useEffect(() => {
    if (!selectedGame)
      return;
    
    const subscriptionPromise = api.game.addUpdateListener(selectedGame.id, () => setLastUpdated(Date.now()));
    return async () => {
      const { close } = await subscriptionPromise;
      close();
    }
  }, [selectedGame && selectedGame.id]);

  if (!games)
    return null;


  return [
    h(WildspaceHeader, { title: 'Character Sheets' }),
    h('div', { class: styles.characterPage }, [
      h('div', { class: styles.characterPageBackground }, [
        h(StarfieldScene),
      ]),
      h('div', { class: styles.characterPageContent }, [
        !selectedGame && [
          h('h2', {}, 'No Game Selected'),
          h('p', {}, 'Select a Game to begin')
        ],
        selectedGame && h(CharacterSelector, { game: selectedGame }),
      ]),
    ]),
  ];
};

renderAppPage(CharacterPage);