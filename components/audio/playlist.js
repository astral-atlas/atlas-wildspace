// @flow strict
/*::
import type { Component, ElementNode, Ref } from '@lukekaalim/act';
import type { AudioPlaylist, AudioTrack, AssetID } from "@astral-atlas/wildspace-models";
*/
import { h, useEffect, useMemo, useRef, useState } from '@lukekaalim/act';
import styles from './index.module.css';
import { useAnimatedList } from "@lukekaalim/act-curve/array";
import { useBezierAnimation } from "@lukekaalim/act-curve/bezier";
import throttle from 'lodash.throttle';
import { AudioLibrary } from "./library";

/*::
export type PlaylistControlsProps = {
  playlist: AudioPlaylist,
  tracks: AudioTrack[],
  renderControls?: (track: AudioTrack, index: number, olRef: Ref<?HTMLOListElement>) => ElementNode,
};
*/

const PlaylistItemControl = ({ track, index, renderControls, olRef }) => {
  const ref = useRef();

  useBezierAnimation(index, index => {
    const { current: li } = ref;
    if (!li)
      return;
    
    li.value = index.position;
    li.style.transform = `translateY(${40 * index.position}px)`
  });

  return h('li', { ref, style: {
    height: '40px',
    position: 'absolute',
    border: '1px solid black',
    right: '40px',
    left: '40px',
  } }, [
    h('div', { style: { display: 'flex', flexDirection: 'row' } }, [
      h('span', {}, track.title),
      h('span', { style: { flexGrow: 1 } } ),
      h('span', {}, [
        !!renderControls && renderControls(track, index.shape[3], olRef),
      ]),
    ]),
  ]);
}

export const PlaylistControls/*: Component<PlaylistControlsProps>*/ = ({ playlist, tracks, renderControls }) => {
  const olRef = useRef();
  const playlistTracks = playlist.trackIds
    .map(trackId => tracks.find(track => track.id === trackId))
    .filter(Boolean)

  const [animations, filter] = useAnimatedList(playlistTracks, playlistTracks);
  useEffect(() => {
    filter(a => a.status.shape[3] !== 1);
  }, [playlistTracks])

  return [
    h('ol', { ref: olRef, style: { position: 'relative', height: `${animations.length * 40}px` } }, [
      ...animations
        .sort((a, b) => a.value.id.localeCompare(b.value.id))
        .map((animation) => {
          if (animation.status.shape[3] === 1)
            return null;
          return h(PlaylistItemControl, {
            key: animation.value.id, index: animation.index,
            track: animation.value, renderControls, olRef
          });
        })
    ])
  ];
};

/*::
export type PlaylistEditorProps = {
  playlist: AudioPlaylist,
  tracks: AudioTrack[],
  onPlaylistChange: (playlist: AudioPlaylist) => mixed,
  onDeletePlaylist: () => mixed,
  assets: { id: AssetID, url: URL }[],
  playlists: AudioPlaylist[]
};
*/

export const PlaylistEditor/*: Component<PlaylistEditorProps>*/ = ({ playlist, tracks, onPlaylistChange, assets, playlists, onDeletePlaylist }) => {
  const [draggingTrack, setDraggingTrack] = useState(null);
  const [stagingPlaylist, setStagingPlaylist] = useState/*:: <AudioPlaylist>*/(playlist);

  useEffect(() => {
    setStagingPlaylist(playlist);
  }, [playlist])

  const renderControls = (track, index, parentRef) => {
    const onMouseDown = (e) => {
      e.target.setPointerCapture(e.id);
      setDraggingTrack(track.id);
    }
    const onMouseUp = (e) => {
      if (track.id === draggingTrack) {
        setDraggingTrack(null);
        onPlaylistChange(stagingPlaylist)
        e.target.releasePointerCapture(e.id);
      }
    }
    const onMouseMove = useMemo(() => throttle((e) => {
      const { current: ol } = parentRef;
      if (!ol || draggingTrack !== track.id)
        return;

      const currentPosition = [e.clientX, e.clientY];
      const clientRect = ol.getBoundingClientRect();
      const offset = -clientRect.top + currentPosition[1];
      const index = Math.floor((offset+20) / 40);
      
      setStagingPlaylist(playlist => {
        const filteredTracks = playlist.trackIds.filter(t => t !== track.id);
        return {
          ...playlist,
          trackIds: [
            ...filteredTracks.slice(0, index),
            track.id,
            ...filteredTracks.slice(index),
          ]
        }
      });
    }, 150), [draggingTrack, track]);
    const onRemoveClick = () => {
      onPlaylistChange({
        ...playlist,
        trackIds: playlist.trackIds.filter(id => id !== track.id)
      })
    }
    return [
      h('button', { onClick: onRemoveClick }, 'Remove'),
      h('button', { onMouseDown, onMouseUp, onMouseMove }, 'Move'),
    ]
  };
  const otherPlaylists = playlists.filter(p => p.id !== playlist.id);
  const onSelect = (selection) => {
    onPlaylistChange({
      ...playlist,
      trackIds: [...new Set([
        ...playlist.trackIds,
        ...selection.tracks,
        ...selection.playlists
          .map(id => playlists.find(p => p.id === id))
          .map(p => p && p.trackIds)
          .filter(Boolean).flat()
      ])]
    })
  };

  return [
    h('div', { class: styles.playlistEditor }, [
      h('button', { onClick: onDeletePlaylist }, 'Delete playlist'),
      h('label', {}, [
        h('span', {}, 'Rename Playlist'),
        h('input', { value: playlist.title, onInput: e => onPlaylistChange({ ...playlist, title: e.target.value }) }),
      ]),
      h('div', { class: styles.playlistEditorTrackList }, [
        h(PlaylistControls, { playlist: stagingPlaylist, tracks, renderControls }),
      ]),
      h(AudioLibrary, { assets, onSelect, playlists: otherPlaylists, selection: { tracks: [...playlist.trackIds], playlists: [] }, tracks })
    ]),
  ];
}

/*::
export type PlaylistInfoProps = {
  playlist: AudioPlaylist,
  tracks: AudioTrack[],
  coverImageURL: ?URL,
};
*/

export const PlaylistInfo/*: Component<PlaylistInfoProps>*/ = ({ playlist, tracks, coverImageURL }) => {
  return h('div', { class: styles.playlistInfo }, [
    coverImageURL && h('img', { src: coverImageURL.href }) || null,
    h('p', {}, playlist.title)
  ])
}