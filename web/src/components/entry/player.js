import { h } from 'preact';
import { useState } from 'preact/hooks';

const EntryFormField = ({ label, value, setValue = () => {}, disabled = false }) => {
  return h('label', {}, [
    label,
    h('input', { onChange: event => setValue(event.currentTarget.value), value, disabled }),
  ]);
};

const JoinRoomForm = ({ joinRoom }) => {
  const [invitation, setInvitation] = useState({ roomId: '', secret: '' });
  const { roomId, secret } = invitation;
  const onSubmit = (event) => {
    event.preventDefault();
    joinRoom(invitation);
  };
  return h('Form', { class: 'entry join-room', onSubmit }, [
    h('h4', {}, 'Join Room'),
    h(EntryFormField, {
      label: 'roomId', value: roomId,
      setValue: roomId => setInvitation({ ...invitation, roomId })
    }),
    h(EntryFormField, {
      label: 'secret', value: secret,
      setValue: secret => setInvitation({ ...invitation, secret })
    }),
    h('input', { type: 'submit' })
  ]);
}

export {
  JoinRoomForm,
};