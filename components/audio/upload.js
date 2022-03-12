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
import { applyLocalStagingTrack, StagingTrackInput } from "./track";

/*::
export type Asset = {
  id: AssetID,
  url: URL
};


export type UploadTrackInputProps = {
  disabled: boolean,
  stagingTracks: StagingTrack[],
  onStagingTracksChange: (stagingTracks: StagingTrack[]) => mixed,
  onStagingTracksSubmit: (stagingTracks: StagingTrack[], playlistName: ?string) => mixed,
};
*/

export const UploadTrackInput/*: Component<UploadTrackInputProps>*/ = ({
  onStagingTracksChange,
  stagingTracks,
  onStagingTracksSubmit,
  disabled
}) => {
  const onChange = async (e) => {
    const files = [...e.target.files].reverse();
    e.target.value = null;

    const nextTracks = await Promise.all(files.map(async (file) => {
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
    const firstTrack = nextTracks[0];
    if (firstTrack && firstTrack.album) {
      setUploadAsPlaylist(true);
      setPlaylistName(firstTrack.album);
    }
    onStagingTracksChange([...stagingTracks, ...nextTracks]);
  }
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setPlaylistName('');
    setUploadAsPlaylist(false);
    onStagingTracksSubmit(stagingTracks, uploadAsPlaylist ? playlistName : null)
  }

  const [uploadAsPlaylist, setUploadAsPlaylist] = useState(false) 
  const [playlistName, setPlaylistName] = useState('') 

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

  const assets = trackData
    .map(({ audioAsset, imageAsset }) => [imageAsset, audioAsset])
    .flat(1)
    .filter(Boolean);
  const tracks = trackData.
    map(({ track }) => track);

  const [editingTrackIndex, setEditingTrackIndex] = useState(-1); 
  const onSelect = (selection) => {
    setEditingTrackIndex(tracks.findIndex(track => track.id === selection[0]))
  };
  const editingTrack = stagingTracks[editingTrackIndex];
  const onTrackChange = (nextTrack) => {
    onStagingTracksChange(stagingTracks.map((track, i) => i === editingTrackIndex ? nextTrack : track))
  };

  const fileInputRef = useRef();
  const onUploadClick = () => {
    const { current: fileInput } = fileInputRef;
    if (!fileInput)
      return;
    fileInput.click();
  }
  const selection = [tracks[editingTrackIndex] && tracks[editingTrackIndex].id]

  return [
    //isUploading && h('progress', { value: uploadProgress, min: 0, max: 1, step: 0.01, style: { width: '100%', display: 'block' } }),
    h('form', { onSubmit, disabled }, [
      h('h3', {}, 'Upload Tracks'),
      h(TracksLibrary, { assets, onSelect, selection, tracks }, [
        h('div', { style: { margin: '4px' } }, [
          h('div', { style: { display: 'flex', flexDirection: 'row', justifyContent: 'center' } }, [
            h('input', { disabled, type: 'submit', value: `Upload ${stagingTracks.length} tracks` }),
            h('button', { type: 'button', disabled, onClick: onUploadClick }, 'Add Files to Upload'),
            h('input', { ref: fileInputRef, style: { display: 'none' }, type: 'file', multiple: true, accept: 'audio/*', files: null, onChange }),
          ]),
          h('div', { style: { display: 'flex', flexDirection: 'row', justifyContent: 'center' }}, [
            h('label', { style: { marginRight: '12px' } }, [
              h('span', {}, 'Upload tracks as Playlist'),
              h('input', { disabled, type: 'checkbox', checked: uploadAsPlaylist, onChange: e => setUploadAsPlaylist(e.target.checked) })
            ]),
            h('label', {}, [
              h('span', { style: { marginRight: '12px' } }, 'Playlist Name'),
              h('input', { disabled: !uploadAsPlaylist || disabled, type: 'text', value: playlistName, onInput: e => setPlaylistName(e.target.value) })
            ]),
          ]),
        ]),
      ]),
    ]),
    editingTrack && h('form', { onSubmit: e => e.preventDefault() }, [
      h('h3', {}, 'Edit Selected'),
       h(StagingTrackInput, { track: editingTrack, onTrackChange })
    ]),
  ];
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