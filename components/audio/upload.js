// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { AudioTrack, AssetID, } from '@astral-atlas/wildspace-models';
import type { StagingTrack } from './track.js';
*/
import { h, useEffect, useRef, useState } from '@lukekaalim/act';

import { v4 as uuid } from 'uuid';
import parseAudioMetadata from "parse-audio-metadata";

import styles from './index.module.css';
import {
  applyLocalStagingTrack,
  StagingTrackInput,
  TrackAssetGrid,
  TrackAssetGridItem,
} from "./track";
import { AssetGrid } from "../asset";
import { AssetGridItem } from "../asset/grid";
import {
  EditorButton,
  EditorCheckboxInput,
  EditorForm,
  EditorFormSubmit,
  EditorHorizontalSection,
  EditorTextInput,
  FilesButtonEditor,
} from "../editor/form";

/*::
export type Asset = {
  id: AssetID,
  url: URL
};


export type UploadTrackInputProps = {
  disabled?: boolean,
  stagingTracks: StagingTrack[],
  onStagingTracksChange: (stagingTracks: StagingTrack[]) => mixed,
  onStagingTracksSubmit: (stagingTracks: StagingTrack[], playlistName: ?string) => mixed,
};

export type LocalTrackData = {
  track: AudioTrack,
  imageAsset: ?Asset,
  audioAsset: Asset
};
*/

export const useLocalTrackData = (stagingTracks/*: StagingTrack[]*/)/*: LocalTrackData[]*/ => {
  const [trackData, setTrackData] = useState/*:: <LocalTrackData[]>*/([]);
  useEffect(() => {
    const trackData = stagingTracks.map(applyLocalStagingTrack);
    setTrackData(trackData);

    return () => {
      for (const { audioAsset, imageAsset } of trackData) {
        if (imageAsset)
          URL.revokeObjectURL(imageAsset.url.href)
        URL.revokeObjectURL(audioAsset.url.href)
      }
    }
  }, [stagingTracks])
  
  return trackData;
}

const UploadTrackControls = ({ stagedTrackCount, onStagingTracksAdd, onSubmitStagingTracks }) => {
  const [uploadAsPlaylist, setUploadAsPlaylist] = useState(false) 
  const [playlistName, setPlaylistName] = useState('');

  const onEditorSubmit = (e) => {
    onSubmitStagingTracks(uploadAsPlaylist ? playlistName : null);
  }

  const onFilesChange = async (files) => {
    const stagingTracks = await Promise.all(files.map(async (file) => {
      const metadata = await parseAudioMetadata(file);
      const { title, albumartist, artist, duration, picture, album } = metadata;
      return {
        id: uuid(),
        audioFile: file,
        imageFile: picture,
      
        title,
        album,
        artist,
      
        trackLengthMs:  duration * 1000,
      }
    }));
    const firstTrack = stagingTracks[0];
    if (firstTrack && firstTrack.album) {
      setUploadAsPlaylist(true);
      setPlaylistName(firstTrack.album);
    }
    onStagingTracksAdd(stagingTracks);
  }

  return h(EditorForm, { onEditorSubmit }, [
    h(EditorHorizontalSection, {}, [
      h(EditorFormSubmit, { label: `Upload ${stagedTrackCount} tracks` }),
      h(FilesButtonEditor, { label: `Add Files to Upload`, multiple: true, accept: 'audio/*', onFilesChange })
    ]),
    h(EditorHorizontalSection, {}, [
      h(EditorCheckboxInput, {
        checked: uploadAsPlaylist,
        onCheckedChange: setUploadAsPlaylist,
        label: `Upload tracks as Playlist`
      }),
      h(EditorTextInput, {
        disabled: !uploadAsPlaylist,
        text: playlistName,
        onTextChange: name => setPlaylistName(name),
        label: `Playlist Name`
      }),
    ]),
  ]);
}

/*::
export type UploadOrder<T, R> = {
  targets: T[],
  resolve: R[] => void,
};
export type UploadRequest<T, R> = {
  target: T,
  promise: Promise<void>
}
export type UploadCompletion<T, R> = {
  target: T,
  result: R,
}
*/

export const useTrackUploader = /*:: <T, R>*/(
  slots/*: number*/,
  upload/*: (target: T) => Promise<R>*/,
  onUploadComplete/*: (target: T, result: R) => mixed*/,
  deps/*: mixed[]*/ = []
)/*: [T[] => Promise<R[]>, UploadOrder<T, R>[], UploadRequest<T, R>[], UploadCompletion<T, R>[]]*/ =>  {

  const [queue, setQueue] = useState/*:: <UploadOrder<T, R>[]>*/([]);
  const [inflightRequests, setInflightRequests] = useState/*:: <UploadRequest<T, R>[]>*/([]);
  const [completedTargets, setCompletedTargets] = useState/*:: <UploadCompletion<T, R>[]>*/([]);

  const uploadTracks = async (targets) => {
    let resolve = null;
    const uploadCompletePromise = new Promise(r => resolve = r);
    if (!resolve)
      throw new Error();
    if (targets.length === 0)
      return [];
    
    const entry = {
      targets,
      resolve,
    };
    const nextQueue = [...queue, entry];
    setQueue(nextQueue);

    const results = await uploadCompletePromise;

    return results;
  };
  useEffect(() => {
    const emptySlots = slots - inflightRequests.length;
    if (emptySlots <= 0)
      return;
    
    const pendingTargets = queue
      .map(order => order.targets.map(target => [order, target]))
      .flat(1)
      .filter(([, target]) =>
        !inflightRequests.find(r => r.target === target) &&
        !completedTargets.find(c => target === c.target))

    const targetsToAdd = pendingTargets.slice(0, emptySlots);
    
    const requestsToAdd = targetsToAdd.map(([order, target]) => ({
      target,
      promise: upload(target).then((result) => {
        setCompletedTargets(completedTargets => {
          const orderCompletions = [
            ...order.targets
              .map(orderTarget => completedTargets.find(t => t.target === orderTarget))
              .filter(Boolean),
            { target, result }
          ];

          const orderComplete = order.targets.length === orderCompletions.length;

          onUploadComplete(target, result);
        
          if (!orderComplete)
            return [...completedTargets, { target, result }];

          setQueue(queuedOrders => queuedOrders.filter(queuedOrder => queuedOrder !== order));

          order.resolve(orderCompletions.map(c => c.result));
          return completedTargets.filter(t => !order.targets.includes(t));
        })
        setInflightRequests(rs => rs.filter(r => r.target !== target))
      }),
    }))
    if (requestsToAdd.length > 0)
      setInflightRequests(r => [...r, ...requestsToAdd])
  }, [queue, inflightRequests, completedTargets, slots, deps])

  return [uploadTracks, queue, inflightRequests, completedTargets]
};

/*::
export type AsyncTasksInfoProps = {
  tasks: []
};
*/

export const AsyncTasksInfo = () => {

};