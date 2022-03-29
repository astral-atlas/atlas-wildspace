# Audio Assets

Audio plays a large role in Wildspace - uploading custom musical cues and tracks
is managed by the AudioAssetLibrary.

## Concepts

### AudioTrack
An AudioTrack represents a set-length piece of audio content with
a name (and optionally a cover image).

### AudioPlaylist
A playlist is a array of tracks in a specific order.
### AudioPlaylistState
A playlist state describes how far through a playlist you are.

## AudioTrackLibrary

::demo{name=track_library}
## AudioPlaylistLibrary

::demo{name=playlist_library}

## TODO

 - [X] Client Player Component
 - [ ] DM Playback Controller
 - [ ] Audio Asset Management Page
    - [ ] Album Upload Component
    - [ ] Playlist Editor Component