import { h } from 'preact';
import { useState } from 'preact/hooks';

const EntryFormField = ({ label, value, setValue = () => {}, disabled = false }) => {
  return h('label', {}, [
    label,
    h('input', { onChange: event => setValue(event.currentTarget.value), value, disabled }),
  ]);
};

const CreateRoomForm = ({ createRoom }) => {
  const [roomId, setRoomId] = useState('');
  const onSubmit = (event) => {
    createRoom(roomId);
    event.preventDefault();
  };
  return h('Form', { class: 'entry create-room', onSubmit }, [
    h('h4', {}, 'Create Room'),
    h(EntryFormField, {
      label: 'roomId', value: roomId,
      setValue: roomId => setRoomId(roomId)
    }),
    h('input', { type: 'submit', value: 'Create Room' })
  ]);
};

const EditRoomForm = ({ editRoom }) => {
  const [invitation, setInvitation] = useState({ roomId: '', refereeSecret: '' });
  const onSubmit = (event) => {
    editRoom(invitation);
    event.preventDefault();
  };
  return h('Form', { class: 'entry edit-room', onSubmit }, [
    h('h4', {}, 'Edit Room'),
    h(EntryFormField, {
      label: 'roomId', value: invitation.roomId,
      setValue: roomId => setInvitation({ ...invitation, roomId })
    }),
    h(EntryFormField, {
      label: 'refereeSecret', value: invitation.refereeSecret,
      setValue: refereeSecret => setInvitation({ ...invitation, refereeSecret })
    }),
    h('input', { type: 'submit' })
  ]);
};

const EditExistingRoomForm = ({ invitation, editRoom, forgetRoom }) => {
  const onSubmit = (event) => {
    editRoom(invitation);
    event.preventDefault();
  };
  return h('Form', { class: 'entry existing edit-room', onSubmit }, [
    h('h4', {}, 'Edit Room'),
    h(EntryFormField, { label: 'roomId', value: invitation.roomId, disabled: true }),
    h(EntryFormField, { label: 'refereeSecret', value: invitation.refereeSecret, disabled: true }),
    h('input', { type: 'submit', value: 'Edit Room' }),
    h('input', { type: 'button', value: 'Forget Room', onClick: forgetRoom }),
  ]);
};

export {
  CreateRoomForm,
  EditRoomForm,
  EditExistingRoomForm,
}