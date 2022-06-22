// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { Game, GameID } from '@astral-atlas/wildspace-models';
*/
/*::
export type MenuGameIdEditorProps = {
  games: $ReadOnlyArray<Game>,
  selectedGameId: GameID,
  onSelectedGameChange: GameID => mixed,
};
*/

import { h } from "@lukekaalim/act";
import styles from './MenuGameIdEditor.module.css';

export const MenuGameIdEditor/*: Component<MenuGameIdEditorProps>*/ = ({
  games,
  selectedGameId,
  onSelectedGameChange,
}) => {
  const onChange = (event) => {
    const nextGameId = event.target.value;
    onSelectedGameChange(nextGameId);
  };

  return h('label', { className: styles.menuGameIdEditor  }, [
    h('span', {}, 'Game'),
    h('select', { onChange }, [
      ...games.map(game =>
        h('option', { value: game.id, selected: selectedGameId }, game.name))
      ])
  ]);
}
