// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
import { h, useState } from '@lukekaalim/act';
import { createClient } from '@astral-atlas/sesame-client';

import styles from './header.module.css';
import { useIdentity } from "../hooks/identity";
import { useAsync } from '../hooks/async';
import { createWebClient } from "@lukekaalim/http-client";
import { useAPI } from '../hooks/api';
import { useNavigation } from '../hooks/navigation';

const GameSelector = () => {
  const { navigate, url } = useNavigation();
  const api = useAPI()
  const [games] = useAsync(() => api.game.list(), []);

  const selectedGameId = url.searchParams.get('gameId');

  if (!games)
    return null;

  const selectedGame = games.find(g => g.id === selectedGameId) || null;

  const onChange = (e) => {
    const newTarget = new URL(url.href);
    newTarget.searchParams.set('gameId', e.target.value);
    navigate(newTarget);
  };

  return [
    h('select', { class: styles.wildspaceHeaderGameSelector, onChange, value: selectedGameId }, [
      !selectedGame && h('option', { selected: true, value: null }, '<No Game Selected>'),
      ...games.map((g, i) =>
        h('option', { selected: g.id === selectedGameId, value: g.id }, g.name))
    ]),
  ]
};

/*::
export type WildspaceHeaderProps = {
  left?: ElementNode,
  right?: ElementNode,
  center?: ElementNode,
};
*/

export const WildspaceHeader/*: Component<WildspaceHeaderProps>*/ = ({ left, right, center }) => {
  const api = useAPI();

  const [user] = useAsync(() => api.self(), [api])

  return [
    h('header', { class: styles.wildspaceHeader }, [
      h('div', { class: styles.wildspaceHeaderLeft }, [
        h('img', { class: styles.wildspaceHeaderIcon, src: "/2d/bi_atlas.svg" }),
        h('h1', { class: styles.wildspaceHeaderTitle }, "Wildspace"),
        h('div', { class: styles.wildspaceHeaderGameSeperator }),
        h('span', {}, left),
      ]),
      h('div', { class: styles.wildspaceHeaderCenter }, [
        h('span', {}, center),
      ]),
      h('div', { class: styles.wildspaceHeaderRight }, [
        h('span', {}, right),
        user ? h('p', { class: styles.wildspaceHeaderIdentity }, ['Welcome, ', h('a', { href: `http://sesame.astral-atlas.com` }, user.name)]) : null,
      ]),
    ]),
  ];
};