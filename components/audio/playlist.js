// @flow strict
/*::
import type { Component, ElementNode, Ref } from '@lukekaalim/act';
import type {
  AudioPlaylist, AudioPlaylistID,
  AudioTrack, AudioTrackID,
  AssetID
} from "@astral-atlas/wildspace-models";

import type { LocalAsset } from "./track";
import type { SelectionActions } from "../editor/selection";
import type { AssetDownloadURLMap } from "../asset/map";
*/
import throttle from 'lodash.throttle';

import { h, useEffect, useMemo, useRef, useState } from '@lukekaalim/act';
import { useAnimatedList } from "@lukekaalim/act-curve/array";
import { useBezierAnimation } from "@lukekaalim/act-curve/bezier";

import styles from './index.module.css';
import { AssetGrid, AssetGridItem } from "../asset/grid";

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
      //h(AudioLibrary, { assets, onSelect, playlists: otherPlaylists, selection: { tracks: [...playlist.trackIds], playlists: [] }, tracks })
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

/*::
export type PlaylistGridItemProps = {
  playlist: AudioPlaylist,
  coverImage?: ?URL,
  selected?: boolean,
  disabled?: boolean,
  onClick?: (event: MouseEvent) => mixed,
  onDblClick?: (event: MouseEvent) => mixed,
};
*/
export const PlaylistGridItem/*: Component<PlaylistGridItemProps>*/ = ({
  playlist,
  coverImage,
  onClick,
  selected,
  disabled,
  onDblClick,
}) => {
  return h(AssetGridItem, {
    onClick,
    onDblClick,
    selected,
    disabled,
    background: !!coverImage && h('img', { src: coverImage.href })
  }, [playlist.title])
}

/*::
export type PlaylistGridProps = {
  playlists: $ReadOnlyArray<AudioPlaylist>,
  tracks?: $ReadOnlyArray<AudioTrack>,
  assets: AssetDownloadURLMap,
  
  selection?: AudioPlaylistID[],
  disabled?: AudioPlaylistID[],

  select?: SelectionActions<AudioPlaylistID>,
};
*/

export const PlaylistGrid/*: Component<PlaylistGridProps>*/ = ({
  playlists,
  select,
  selection = [],
  tracks = [],
  assets
}) => {
  return h(AssetGrid, {
    classList: [styles.audioGrid],
    onClick: select && (event => {
      if (event.target === event.currentTarget)
       select.replace([])
    })
  }, playlists.map(playlist => {
    const firstTrack = tracks.find(t => t.id === playlist.trackIds[0]);
    const coverImage = firstTrack && firstTrack.coverImageAssetId && assets.get(firstTrack.coverImageAssetId);
    return h(PlaylistGridItem, {
      playlist,
      onClick: select && ((event) => {
        if (!event.shiftKey)
          return select.replace([playlist.id]);
        if (selection.includes(playlist.id))
          return select.remove([playlist.id]);
        return select.add([playlist.id]);
      }),
      onDblClick: select && ((event) => {
        if (event.shiftKey)
          return;
        select.add(playlists.map(p => p.id));
      }),
      selected: selection.includes(playlist.id),
      coverImage: coverImage ? new URL(coverImage.downloadURL) : null,
    })
  }));
}