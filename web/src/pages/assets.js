// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { StyleSheet } from '../lib/style'; */
import { h } from 'preact';
import { UploadAudioForm, AudioAssetList } from '../components/admin/assets';
import { useAsync } from '../hooks/useAsync';
import { useWildspaceClient } from '../hooks/useWildspace';
import { cssClass, cssStylesheet } from "../lib/style";


const AssetPage = ()/*: Node*/ => {
  return [
    h(UploadAudioForm),
    h(AudioAssetList),
  ];
};

export {
  AssetPage,
};
