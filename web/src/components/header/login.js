// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useSpring, animated, useTransition } from 'react-spring';
import { useStore } from '../../context/appContext';

export const style = `
  .header-login-container {
    width: 300px;
    height: 100%;
    position: relative;
  }
  .header-login-panel-container {
    position: absolute;
    background: white;
    box-shadow: 0 0 15px #ccc; 
    right: 0;
    min-width: 100%;
  }
  .header-login-button {
    position: relative;
    height: 100%;
    width: 100%;
  }
  .header-login-panel {
    padding: 2em;
    box-sizing: border-box;
  }
  .header-login-panel-controls {
    display: flex;
    flex-direction: row;
  }
`;

const HeaderLoginButton = ()/*: Node*/ => {
  const [state] = useStore();
  const [panelDisplayed, setPanelDisplayed] = useState(false);

  const style = useSpring({
    top: panelDisplayed ? '100%' : '-200%',
    opacity: panelDisplayed ? 1 : 0,
  });

  const loginText = state.user.selfDetails.type === 'logged-in' ?
    state.user.selfDetails.user.type === 'player' ?
      `Logged in as ${state.user.selfDetails.user.player.name} (Player)` 
      : `Logged in as ${state.user.selfDetails.user.gameMaster.name} (Game Master)` 
    : 'Log In' 

  return h('div', { class: 'header-login-container' }, [
    h(animated.div, { style:
      { ...style,
        display: style.opacity.interpolate(o => o === 0 ? 'none' : undefined)
      }, class: 'header-login-panel-container'
    }, h(HeaderLoginPanel)),
    h('button', { class: 'header-login-button', onClick: () => setPanelDisplayed(!panelDisplayed) }, loginText),
  ]);
};

const HeaderLoginPanel = ()/*: Node*/ => {
  const [state, dispatch] = useStore();

  const existingCreds = state.user.credentials;

  const [userType, setUserType] = useState/*::<'player' | 'game-master'>*/(existingCreds?.type || 'player');

  const [userId, setUserId] = useState(existingCreds?.id || '');
  const [secret, setSecret] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const newCredentials = {
      type: userType,
      id: userId,
      secret
    };
    dispatch({ type: 'update-creds', newCredentials });
  };
  const onLogout = () => {
    dispatch({ type: 'logout' });
  };

  const isLoggedIn = state.user.selfDetails.type == 'logged-in';

  return h('form', { class: 'header-login-panel', onSubmit }, [
    h('label', {}, ['type',
      h('select', { disabled: isLoggedIn, value: userType, onInput: e => setUserType(e.currentTarget.value) }, [
        h('option', { value: 'game-master' }, 'Game Master'),
        h('option', { value: 'player' }, 'Player')
    ])]),
    h('label', {}, ['userId', 
      h('input', { type: 'text', disabled: isLoggedIn, value: userId, onInput: e => setUserId(e.currentTarget.value) })]),
    h('label', {}, ['secret', 
      h('input', { type: 'password', disabled: isLoggedIn, value: secret, onInput: e => setSecret(e.currentTarget.value) })]),
    h('div', { class: 'header-login-panel-controls' }, [
      h('input', { type: 'submit', disabled: isLoggedIn, value: 'login' }),
      h('input', { type: 'button', disabled: !isLoggedIn, value: 'logout', onClick: onLogout }),
    ]),
  ]);
};

export {
  HeaderLoginButton,
  HeaderLoginPanel,
};
