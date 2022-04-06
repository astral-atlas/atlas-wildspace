// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { RoomID, GameID } from "@astral-atlas/wildspace-models";
*/
import { h, useState } from "@lukekaalim/act";
import { useAsync } from "../utils";
import styles from './index.module.css';

/*::
export type HomepageRoomSelectorProps = {
  client: WildspaceClient,
  onRoomSelect?: (game: GameID, room: RoomID) => mixed, 
};
*/

export const HomepageRoomSelector/*: Component<HomepageRoomSelectorProps>*/ = ({
  client,
  onRoomSelect
}) => {
  const [gamesResponse] = useAsync(async () => client.game.list(), [client])
  const games = gamesResponse || [];
  const [selectedGameId, setSelectedGameId] = useState/*:: <?GameID>*/(null);

  const gameId = (
    ((games.find(g => g.id === selectedGameId)) && selectedGameId) ||
    (games[0] && games[0].id)
  );

  const [roomsResponse] = useAsync(async () => gameId ? await client.room.list(gameId) : [], [gameId]);
  const rooms = roomsResponse || [];
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const roomId = (
    ((rooms.find(r => r.id === selectedRoomId)) && selectedRoomId) ||
    (rooms[0] && rooms[0].id)
  );

  const onChangeGameId = async (e) => {
    const gameId = e.target.value;
    setSelectedGameId(gameId);
  }
  const onChangeRoomId = (e) => {
    setSelectedRoomId(e.target.value);
  }
  const onSubmit = (e) => {
    e.preventDefault();

    if (!gameId || !roomId)
      return;
    
    onRoomSelect && onRoomSelect(gameId, roomId)
  };

  return h('form', { classList: [styles.roomSelectionForm], onSubmit }, [
    h('label', { classList: [styles.roomSelectionInputContainer] }, [
      h('span', {}, 'Game'),
      h('select', {
        classList: [styles.roomSelectionInput],
        onInput: onChangeGameId
      }, games.map(game =>
        h('option', { value: game.id, selected: gameId === game.id }, game.name))),
    ]),

    h('label', { classList: [styles.roomSelectionInputContainer] }, [
      h('span', {}, 'Room'),
      h('select', {
        disabled: !gameId,
        classList: [styles.roomSelectionInput],
        onInput: onChangeRoomId
      }, rooms.map(room =>
        h('option', { value: room.id, selected: roomId === room.id }, room.title))),
    ]),

    h('input', {
      classList: [styles.roomSelectionSubmit],
      type: 'submit',
      disabled: !gameId || !roomId,
      value: 'Enter Room'
    }),
  ]);
};