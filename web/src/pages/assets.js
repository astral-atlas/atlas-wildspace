// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useAsync } from '../hooks/useAsync';
import { useWildspaceClient } from '../hooks/useWildspace';

const UploadForm = () => {
  const [name, setName] = useState('');
  const [file, setFile] = useState();
  const [type, setType] = useState('octet-stream');
  const client = useWildspaceClient();

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
    await client.asset.upload(name, type, buffer);
  }


  return h('form', { onSubmit }, [
    h('input', { type: 'file', onChange: e => setFile(e.currentTarget.files.item(0)) }),
    h('input', { type: 'text', value: name, onInput: e => setName(e.currentTarget.value) }),
    h('select', { value: type, onChange: e => setType(e.currentTarget.value) }, [
      h('option', { value: 'octet-stream' }, 'generic'),
      h('option', { value: 'audio/ogg' }, 'audio/ogg'),
      h('option', { value: 'image/png' }, 'image/png'),
    ]),
    h('input', { type: 'submit', value: 'submit' }),
  ]);
};

const AssetPage = ()/*: Node*/ => {
  const client = useWildspaceClient();
  const [assets] = useAsync(async () => client.asset.list(), [client]);
  const [assetLinks] = useAsync(async () => !assets
    ? null
    : Promise.all(assets.map(asset => client.asset.getAssetLink(asset.id))),
    [client, assets]);

  if (!assetLinks || !assets)
    return null;

  const assetComponent = assetLinks.map((link, index) => {
    const asset = assets[index];
    switch (asset.type) {
      case 'image/png':
        return [
          h('a', { href: link }, asset.name),
          h('img', { src: link })
        ];
      case 'audio/ogg':
        return [
          h('a', { href: link }, asset.name),
          h('audio', { controls: true, src: link })
        ];
      default:
        return h('a', { href: link }, asset.name);
    }
  });
    
  return [
    h(UploadForm, { key: '0' }),
    ...assetComponent,
  ];
};

export {
  AssetPage,
};
