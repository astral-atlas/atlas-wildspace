import { h } from 'preact';
import { useState } from 'preact/hooks';

import { usePageContext } from '../context/pageContext';
import { useAppContext } from '../context/appContext';

const FormInput = ({ labelText, answer, onAnswerChange = () => {}, disabled }) => {
  const onChange = (event) => {
    onAnswerChange(event.currentTarget.value);
  };

  return [
    h('label', {}, [
      labelText, 
      h('input', { type: 'text', onChange, value: answer, disabled })
    ]),
  ];
};

const JoinRoomForm = () => {
  const [roomId, setRoomId] = useState('');
  const [secret, setSecret] = useState('');
  const [,, navigate] = usePageContext();
 
  const onSubmit = (event) => {
    event.preventDefault();
    console.log(`Trying to enter room "${roomId}" with secret "${secret}"`);
    navigate('/room');
  };

  return h('form', { class: 'join-room', onSubmit }, [
    h(FormInput, {
      labelText: 'Room ID',
      answer: roomId,
      onAnswerChange: setRoomId }
    ),
    h(FormInput, {
      labelText: 'Player Secret',
      answer: secret,
      onAnswerChange: setSecret }
    ),
    h('input', { type: 'submit', value: 'Enter Room with Secret' }),
  ])
};

const RejoinRoomForm = ({ existingRoomId, existingSecret }) => {
  const [,, navigate] = usePageContext();

  const onSubmit = (event) => {
    event.preventDefault();
    console.log(`Trying to enter room "${existingRoomId}" with secret "${existingSecret}"`);
    navigate('/room');
  };

  return h('form', { class: 'rejoin-room', onSubmit }, [
    h(FormInput, {
      labelText: 'Room ID',
      answer: existingRoomId,
      disabled: true,
    }),
    h(FormInput, {
      labelText: 'Secret',
      answer: existingSecret,
      disabled: true,
    }),
    h('input', { type: 'button', value: 'Forget Room' }),
    h('input', { type: 'submit', value: 'Rejoin Room' }),
  ])
};

const CreateRoomForm = ({ }) => {
  const [,, navigate] = usePageContext();
  const [roomId, setRoomId] = useState('');
  const [refereeSecret, setRefereeSecret] = useState('');
  const [appState, setAppState] = useAppContext();

  const onSubmit = (event) => {
    event.preventDefault();
    console.log(`Trying to enter room editor "${roomId}" with secret "${refereeSecret}"`);
    setAppState({
      ...appState,
      refereeInvitations: [
        ...appState.refereeInvitations.filter(invitation => invitation.roomId !== roomId),
        {
          roomId,
          refereeSecret
        },
      ]
    })
    navigate('/room-editor', { roomId });
  };

  return h('form', { class: 'create-room', onSubmit }, [
    h(FormInput, {
      labelText: 'Room ID',
      answer: roomId,
      onAnswerChange: setRoomId
    }),
    h(FormInput, {
      labelText: 'Referee Secret',
      answer: refereeSecret,
      onAnswerChange: setRefereeSecret
    }),
    h('input', { type: 'submit', value: 'Create Room' }),
  ])
};

export {
  JoinRoomForm,
  RejoinRoomForm,
  CreateRoomForm
};