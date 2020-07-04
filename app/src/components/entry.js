import { h } from 'preact';

const EntryFormField = ({ label, value, setValue = () => {}, disabled = false }) => {
  return h('label', {}, [
    label,
    h('input', { onChange: event => setValue(event.currentTarget.event), value, disabled }),
  ]);
};

const CreateRoomForm = ({ createRoom }) => {
  const [roomId, setRoomId] = useState('');
  const onSubmit = () => {
    createRoom(roomId);
  };
  return h('Form', { class: 'create-room', onSubmit }, [
    h('h4', {}, 'Create Room'),
    h(EntryFormField, {
      label: 'roomId', value: roomId,
      onChange: roomId => setRoomId(roomId)
    }),
    h('input', { type: 'submit', value: 'Create Room' })
  ]);
};

const EditRoomForm = ({ editRoom }) => {
  const [invitation, setInvitation] = useState({ roomId: '', refereeSecret: '' });
  const onSubmit = () => {
    editRoom(invitation);
  };
  return h('Form', { class: 'edit-room', onSubmit }, [
    h('h4', {}, 'Edit Room'),
    h(EntryFormField, {
      label: 'roomId', value: roomId,
      onChange: roomId => setInvitation({ ...invitation, roomId })
    }),
    h(EntryFormField, {
      label: 'refereeSecret', value: refereeSecret,
      onChange: refereeSecret => setInvitation({ ...invitation, refereeSecret })
    }),
    h('input', { type: 'submit' })
  ]);
};

const EditExistingRoomForm = ({ invitation, editRoom }) => {
  const onSubmit = () => {
    editRoom(invitation);
  };
  return h('Form', { class: 'edit-room', onSubmit }, [
    h('h4', {}, 'Edit Room'),
    h(EntryFormField, { label: 'roomId', value: invitation.roomId, disabled }),
    h(EntryFormField, { label: 'refereeSecret', value: invitation.refereeSecret, disabled }),
    h('input', { type: 'submit', value: 'Edit Room' }),
    h('input', { type: 'button', value: 'Forget Room' }),
  ]);
};

export {
  CreateRoomForm,
  EditRoomForm,
  EditExistingRoomForm,
}