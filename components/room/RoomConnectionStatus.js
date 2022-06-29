// @flow strict

import { h, useEffect, useState } from "@lukekaalim/act"
import signalIconURL from './signal_icon.svg';

import styles from './RoomConnectionStatus.module.css';

const READY_STATE_TEXT = {
  0: 'Connecting',
  1: '',
  2: 'Disconnecting',
  3: 'Disconnected from Server',
}


export const RoomConnectionStatus = ({ gameUpdatesConnection: { socket }, reconnectGameUpdates }) => {
  const [readyState, setReadyState] = useState(null);
  useEffect(() => {
    setReadyState(socket.readyState)
    const onClose = (e) => {
      setReadyState(socket.readyState)
    };
    const onError = (e) => {
      setReadyState(socket.readyState)
    }
    socket.addEventListener('close', onClose)
    socket.addEventListener('error', onError)
    return () => {
      socket.removeEventListener('close', onClose)
      socket.removeEventListener('error', onError)
    }
  }, [socket])
  const filter = readyState === 1 ? '' : 'hue-rotate(230deg) saturate(6) brightness(1.5)';

  return h('div', { className: styles.connectionStatus }, [
    h('div', { style: { filter, width: '1.5em', height: '1.5em' }},
      h('img', { src: signalIconURL, className: styles.connectionIcon })),
    !!(readyState !== null && readyState !== 1) && READY_STATE_TEXT[readyState],
    h('button', { onClick: reconnectGameUpdates }, 'Reconnect')
  ])
}