// @flow strict
/*:: import type { Game } from '@astral-atlas/wildspace-models'; */
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { useAPI } from "../hooks/api.js";
import { useURLParam } from "../hooks/navigation.js";
import { clientContext, useAsync } from './hooks.js';

import styles from './index.module.css';

const getValidAudioType = (type) => {
  switch (type) {
    case 'video/ogg':
      return 'application/ogg';
    default:
      return type;
  }
}

const NewTrackEditor = ({ game, u, onCreate }) => {
  const client = useAPI();
  const [newTrack, setNewTrack] = useState({ file: null, title: '', artist: '', });

  const onSubmit = async (e) => {
    e.preventDefault();
    const element = ref.current;
    const { file, title, artist } = newTrack;
    if (!element || !file)
      throw new Error();
    onCreate(await client.audio.tracks.create(game.id, title, artist, getValidAudioType(file.type), element.duration * 1000, await file.arrayBuffer()));
  }
  const ref = useRef/*:: <?HTMLAudioElement>*/(null);
  const fileURL = useMemo((() => (newTrack.file && URL.createObjectURL(newTrack.file))), [newTrack.file && newTrack.file.name]);

  return [
    h('form', { onSubmit, class: styles.simpleEditorForm }, [
      h('label', {}, ['Title',
        h('input', { type: 'text', onChange: e => setNewTrack(v => ({ ...v, title: e.target.value })), value: newTrack.title })]),
      h('label', {}, ['Artist',
        h('input', { type: 'text', onChange: e => setNewTrack(v => ({ ...v, artist: e.target.value })), value: newTrack.artist })]),
      h('label', {}, ['Audio File',
        h('input', { type: 'file', onChange: e => {
          const file = e.target.files[0];
          setNewTrack(v => ({ ...v, file, title: file.name }))
      } })]),
      fileURL && h('label', {}, ['Preview',
        h('audio', { src: fileURL, ref, controls: true, autoplay: true })
      ]),
      h('input', { type: 'submit', disabled: !fileURL, value: 'Add new Track' })
    ]),
  ];
};
const ExistingTrackEditor = ({ game, trackId, u, onGameUpdate }) => {
  const client = useAPI();
  const [trackData] = useAsync(() => client.audio.tracks.read(game.id, trackId), [client, u, trackId])

  if (!trackData)
    return null;

  const { asset, track, trackDownloadURL } = trackData;

  const onSubmit = async (e) => {
    e.preventDefault();
  }
  const onClickDelete = async (e) => {
    e.preventDefault();
    await client.audio.tracks.remove(game.id, track.id);
    onGameUpdate();
  }
  

  return [
    h('form', { onSubmit, class: styles.simpleEditorForm }, [
      h('label', {}, ['Preview',
        h('audio', { src: trackDownloadURL.href, controls: true, autoplay: true })
      ]),
      h('a', { href: trackDownloadURL.href }, 'Link to Audio Track'),
      h('button', { onClick: onClickDelete }, 'Delete Track')
    ]),
  ];
}

export const TracksEditor/*: Component<{ game: Game, onGameUpdate: () => mixed, u: number }>*/ = ({ game, onGameUpdate, u }) => {
  const client = useAPI();
  const [trackId, setTrackId] = useURLParam("trackId");
  const [tracks] = useAsync(() => client.audio.tracks.list(game.id), [client, u, game.id])

  if (!tracks)
    return null;

  const onSubmit = async (e) => {
    e.preventDefault();
  }
  const onCreate = ({ track }) => {
    setTrackId(track.id);
    onGameUpdate();
  }

  return [
    h('h3', {}, 'Track Editor'),
    h('div', {}, [
      h('button', { onClick: () => setTrackId(null), disabled: trackId === null }, 'Create New Track'),
      ...tracks.map(track => h('button', { onClick: () => setTrackId(track.id), disabled: trackId === track.id }, `Edit ${track.title}`))
    ]),
    trackId === null && h(NewTrackEditor, { u, onCreate, game }),
    trackId !== null && h(ExistingTrackEditor, { u, onGameUpdate, game, trackId }),
  ];
};