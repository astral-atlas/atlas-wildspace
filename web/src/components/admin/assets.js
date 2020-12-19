// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { StyleSheet } from '../../lib/style'; */
/*:: import type { Asset, AudioAsset, AssetURL } from '@astral-atlas/wildspace-models'; */
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { cssClass, cssStylesheet } from "../../lib/style";
import { useWildspaceClient } from '../../hooks/useWildspace';
import { useAsync } from '../../hooks/useAsync';

const uploadAudioFormClass = cssClass('upload-audio-form', {
  display: 'flex',
  'flex-direction': 'column',
  padding: '25px',
  width: '200px'
});
const uploadAudioLabelClass = cssClass('upload-audio-label', {
  display: 'flex',
  'flex-direction': 'column',
});
const uploadAudioFileInputClass = cssClass('upload-audio-file-input', {
  width: '100%'
});

export const UploadAudioForm = ()/*: Node*/ => {
  const [name, setName] = useState('');
  const [file, setFile] = useState();
  const [type, setType] = useState('octet-stream');
  const client = useWildspaceClient();

  const onFileSelect = (e) => {
    const file = e.currentTarget.files.item(0);
  
    setFile(file);
    setType(file.type)
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file)
      return;
    
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    const buffer = await new Promise(res => {
      reader.addEventListener('loadend', () => res(reader.result))
    });
    if (!buffer || typeof buffer === 'string')
      throw new Error();
    await client.asset.addAudioAsset(name, type, new Uint8Array(buffer));
  }

  return h('form', { class: 'upload-audio-form', onSubmit }, [
    h('label', { class: 'upload-audio-label' }, ['Audio File to Upload',
      h('input', { class: 'upload-audio-file-input', type: 'file', onChange: onFileSelect })]),
    h('label', { class: 'upload-audio-label' }, ['Asset Name',
      h('input', { type: 'text', value: name, onInput: e => setName(e.currentTarget.value) })]),
    h('label', { class: 'upload-audio-label' }, ['Content Type',
      h('input', { type: 'text', value: type, onInput: e => setType(e.currentTarget.value) })]),
    
    h('input', { type: 'submit', value: 'submit' }),
  ]);
};

/*::
type AudioAssetInfoProps = {
  audioAsset: AudioAsset,
};
*/

const audioAssetInfo = cssClass('audio-asset-info', {
  display: 'flex',
  'flex-direction': 'column',
});
const audioAssetInfoId = cssClass('audio-asset-info-id', {
  'overflow-x': 'auto'
});
const audioAssetInfoLink = cssClass('audio-asset-info-link', {
  'overflow': 'auto'
});
const audioAssetInfoPreview = cssClass('audio-asset-info-preview', {
  width: '100%'
});

export const AudioAssetInfo = ({ audioAsset }/*: AudioAssetInfoProps*/)/*: Node*/ => {
  return h('article', { class: 'audio-asset-info' }, [
    h('p', {}, audioAsset.name),
    h('pre', { class: 'audio-asset-info-id' }, audioAsset.audioAssetId),
    h('a', { class: 'audio-asset-info-link', href: audioAsset.url }, audioAsset.url),
    h('audio', { controls: true, class: 'audio-asset-info-preview', src: audioAsset.url }),
  ]);
};

const audioAssetList = cssClass('audio-asset-list', {
  display: 'flex',
  'flex-direction': 'row',
  'list-style-type': 'none',
  padding: '0',
  margin: '0',
});
const audioAssetListElement = cssClass('audio-asset-list-element', {
  'margin': '8px',
  border: '1px solid black',
  padding: '8px',
  width: '200px',
});

export const AudioAssetList = ()/*: Node*/ => {
  const client = useWildspaceClient();
  const [audioAssets] = useAsync(async () => client.asset.listAudioAssets(), [client]);
  if (!audioAssets)
    return null;
  return h('ul', { class: 'audio-asset-list' }, [
    ...audioAssets.map(audioAsset => {
      return h('li', { class: 'audio-asset-list-element' }, h(AudioAssetInfo, { audioAsset }));
    })
  ]);
};


export const assetStyles/*: StyleSheet*/ = cssStylesheet([
  uploadAudioFormClass,
  uploadAudioLabelClass,
  uploadAudioFileInputClass,
  audioAssetInfo,
  audioAssetInfoId,
  audioAssetList,
  audioAssetListElement,
  audioAssetInfoLink,
  audioAssetInfoPreview,
]);