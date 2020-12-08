// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { GameID } from '@astral-atlas/wildspace-models'; */
import { Fragment, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useSpring, animated, useTransition } from 'react-spring';

import { useStore } from '../../context/appContext';
import { useWildspaceClient } from '../../hooks/useWildspace';
import { useAsync } from '../../hooks/useAsync';

export const style = `
  .header-game-button-container {
    position: relative;
    height: 100%;
  }
  .header-game-panel-container {
    position: absolute;
    background-color: white;
    box-shadow: 0 0 15px #ccc;
    right: 0;
    min-width: 100%;
  }
  .header-game-button {
    position: relative;
    height: 100%;
  }
  .header-game-panel {
    display: flex;
    flex-direction: column;
  }
`;

const HeaderGameSelectButton = ()/*: Node*/ => {
  const [panelDisplayed, setPanelDisplayed] = useState(false);
  const style = useSpring({
    top: panelDisplayed ? '100%' : '-200%',
    opacity: panelDisplayed ? 1 : 0,
  });

  const [store] = useStore();
  const activeGameId = store.game.activeGameId;
  const client = useWildspaceClient();

  const [gameIds] = useAsync(async () => await client.game.getGameIds(), [client]);
  const [activeGame] = useAsync(async () =>
    activeGameId && gameIds && gameIds.includes(activeGameId) ?
      await client.game.getGame(activeGameId)
      : null,
    [client, gameIds, activeGameId]);

  if (store.user.selfDetails.type !== 'logged-in')
    return null;
  if (!gameIds || gameIds.length < 1)
    return null;

  const buttonText = (activeGameId == null || activeGame == null) ?
    '(No Game Selected)'
    : activeGame.name;
  
  return h('div', { class: 'header-game-button-container'}, [
    h(animated.div, { style:
      { ...style,
        display: style.opacity.interpolate(o => o === 0 ? 'none' : undefined)
      }, class: 'header-game-panel-container'
    }, h(HeaderGameSelectPanel, { gameIds })),
    h('button', { class: 'header-game-button', onClick: () => setPanelDisplayed(!panelDisplayed)}, buttonText),
  ]);
};
/*::
type PanelProps = {
  gameIds: Array<GameID>,
};
*/

const HeaderGameSelectPanel = ({ gameIds }/*: PanelProps */)/*: Node*/ => {
  const [, dispatch] = useStore();
  return h('div', { class: 'header-game-panel' }, [
    ...gameIds.map(id => h('button', { onClick: () => {
      dispatch({ type: 'set-active-game', gameId: id })
    }}, id))
  ]);
};

export {
  HeaderGameSelectButton,
  HeaderGameSelectPanel,
}