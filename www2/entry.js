// @flow strict
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { render } from '@lukekaalim/act-web';

import { AuthorizerFrame } from '@astral-atlas/sesame-components';
import { createWildspaceClient } from '@astral-atlas/wildspace-client2';

import styles from './index.module.css';

const wildspaceClientContext = createContext(createWildspaceClient({}, '127.0.0.1:5567'))

const TrackForm = ({ onTrackSubmit }) => {
  const client = useContext(wildspaceClientContext);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');

  const [file, setFile] = useState(null);
  const ref = useRef/*:: <?HTMLAudioElement>*/(null);

  const fileURL = useMemo((() => (console.log('re-memo'), file && URL.createObjectURL(file))), [file && file.name]);
  
  const [audioError, setAudioError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const { current: audioElement } = ref;
    if (!audioElement || !file)
      throw new Error('No Audio Loaded')

    onTrackSubmit(title, artist, file.type, audioElement.duration * 1000, await file.arrayBuffer());
  };

  const onFileChange = (e) => {
    setFile((e.target.files[0]/*: any*/));
    setTitle(e.target.files[0].name);
  }

  return [
    h('form', { class: styles.postAudioTrackForm, onSubmit }, [
      h('h2', {}, 'Add new Track'),
      audioError && h('pre', {}, audioError.message),
      h('label', {}, ['Title', h('input', { type: 'text', onChange: e => setTitle(e.target.value), value: title })]),
      h('label', {}, ['Artist', h('input', { type: 'text', onChange: e => setArtist(e.target.value), value: artist })]),

      h('label', { onChange: onFileChange }, ['Track Data', h('input', { type: 'file' })]),
      fileURL && h('label', {}, ['Demo audio',
        h('audio', { src: fileURL, controls: true, autoplay: true, ref })]),
      h('input', { type: 'submit', value: 'Add new Track' })
    ])
  ];
};

const Wildspace = () => {
  const client = useContext(wildspaceClientContext);

  const [lastFetched, setLastFetched] = useState(Date.now());
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    (async () => {
      setTracks(await Promise.all((await client.audio.tracks.list('0')).map(track => client.asset.peek(track.trackAudioAssetId))));
    })();
  }, [lastFetched]);

  const onTrackSubmit = async (title, artist, MIMEType, trackLengthMs, content) => {
    const { trackDownloadURL } = await client.audio.tracks.create('0', title, artist, MIMEType, trackLengthMs, content);
    setLastFetched(Date.now());
  };

  return [
    h(TrackForm, { onTrackSubmit }),
    ...tracks.map(({ downloadURL }) => h('audio', { class: styles.audioTrackPreview, src: downloadURL, controls: true }))
  ];
};

const main = () => {
  const { body } = document;
  if (!body)
    throw new Error();
  
  render(h(Wildspace), body);
};

main();