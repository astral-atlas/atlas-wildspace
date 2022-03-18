// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { AudioTrack, AssetID, } from '@astral-atlas/wildspace-models';
import type { StagingTrack } from './track.js';
*/
import { TracksLibrary } from "./library";
import { h, useEffect, useRef, useState } from '@lukekaalim/act';

import { v4 as uuid } from 'uuid';
import parseAudioMetadata from "parse-audio-metadata";

import styles from './index.module.css';
import {
  applyLocalStagingTrack,
  StagingTrackInput,
  TrackAssetGrid,
  TrackAssetGridItem,
  MultiStagingTrackInput,
} from "./track";
import { AssetGrid } from "../asset";
import { AssetGridItem } from "../asset/grid";

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

export const UploadTrackInput/*: Component<UploadTrackInputProps>*/ = ({
  onStagingTracksChange,
  onStagingTracksSubmit,
  stagingTracks,
  disabled
}) => {
  const onStagingTracksAdd = (nextStagingTracks) => {
    onStagingTracksChange([...stagingTracks, ...nextStagingTracks]);
  }
  const onSubmitStagingTracks = async (playlistName) => {
    onStagingTracksSubmit(stagingTracks, playlistName)
  }

  const [trackData, setTrackData] = useState/*:: <{ track: AudioTrack, imageAsset: ?Asset, audioAsset: Asset }[]>*/([]);
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

  const [selectionIndices, setSelectionIndices] = useState([]);
  const onGridClick = (event) => {
    if (event.defaultPrevented)
      return;
    setSelectionIndices([])
  }
  const onSelect = (trackId, event) => {
    event.preventDefault()
    const index = trackData.findIndex(data => data.track.id === trackId);
    if (event.shiftKey)
      setSelectionIndices(s => [...s, index]);
    else
      setSelectionIndices([index]);
  };
  
  const onTrackChange = (nextTrack) => {
    onStagingTracksChange(stagingTracks.map((track, i) => i === selectionIndices[0] ? nextTrack : track))
  };
  const onTracksChange = (mapNextTrack) => {
    onStagingTracksChange(stagingTracks.map((track, i) => selectionIndices.includes(i) ? mapNextTrack(track) : track))
  }

  return [
    h(UploadTrackControls, { stagedTrackCount: trackData.length, onStagingTracksAdd, onSubmitStagingTracks }),
    h(TrackAssetGrid, { onClick: onGridClick }, [
      trackData.map(({ track, audioAsset, imageAsset }, index) =>
        h(TrackAssetGridItem, {
          track,
          selected: selectionIndices.includes(index),
          coverImageURL: imageAsset && imageAsset.url,
          onClick: e => onSelect(track.id, e)
        }))
    ]),
    selectionIndices.length < 2
    ? selectionIndices.length === 1 &&
        h(StagingTrackInput, { track: stagingTracks[selectionIndices[0]], onTrackChange, selected: true })
    : h(MultiStagingTrackInput, { tracks: selectionIndices.map(i => stagingTracks[i]), onTracksChange }),
  ];
}

export const UploadTrackControls = ({ stagedTrackCount, onStagingTracksAdd, onSubmitStagingTracks }) => {
  const [uploadAsPlaylist, setUploadAsPlaylist] = useState(false) 
  const [playlistName, setPlaylistName] = useState('');

  const fileInputRef = useRef();
  const onUploadClick = () => {
    const { current: fileInput } = fileInputRef;
    if (!fileInput)
      return;
    fileInput.click();
  }
  const onSubmit = (e) => {
    e.preventDefault();
    onSubmitStagingTracks(uploadAsPlaylist ? playlistName : '');
  }

  const onChange = async (e) => {
    e.preventDefault();
    const files = [...e.target.files];
    e.target.files = null;

    const stagingTracks = await Promise.all(files.map(async (file) => {
      const metadata = await parseAudioMetadata(file);
      const { title, albumartist, artist, duration, picture, album } = metadata;
      return {
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

  return h('form', { classList: [styles.trackUploadControls], onSubmit }, [
    h('div', { classList: [styles.trackUploadSubmitControls] }, [
      h('input', { type: 'submit', value: `Upload ${stagedTrackCount} tracks` }),
      h('button', { type: 'button', onClick: onUploadClick }, 'Add Files to Upload'),
      h('input', { type: 'file', ref: fileInputRef, style: { display: 'none' }, multiple: true, accept: 'audio/*', onChange }),
    ]),
    h('div', { classList: [styles.trackUploadPlaylistControls] }, [
      h('label', { style: { marginRight: '12px' } }, [
        h('span', {}, 'Upload tracks as Playlist'),
        h('input', { type: 'checkbox', checked: uploadAsPlaylist, onChange: e => setUploadAsPlaylist(e.target.checked) })
      ]),
      h('label', {}, [
        h('span', { style: { marginRight: '12px' } }, 'Playlist Name'),
        h('input', { disabled: !uploadAsPlaylist, type: 'text', value: playlistName, onInput: e => setPlaylistName(e.target.value) })
      ]),
    ])
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