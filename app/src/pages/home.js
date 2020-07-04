import { h } from 'preact';
import { CreateRoomForm, EditRoomForm, EditExistingRoomForm } from '../components/entry/referee';
import { useAppContext } from '../context/appContext';
import { usePageContext } from '../context/pageContext';
import { createWildspaceClient } from '@astral-atlas/wildspace-client';

const style = `
main.home {
  display: flex;
  flex-direction: row;
}
main.home section {
  padding: 24px;
  border-radius: 2px;
  min-width: 300px;
}
main.home section.left {
  margin-right: 10px;
}
main.home section.right {
  margin-left: 10px;
}
main.home h2 {
  font-family: sans-serif;
  text-align: center;
}
main.home section.player {
  background-color: #c5e3e8;
}
main.home section.referee {
  background-color: #f78781;
}
`;

const wildspaceClient = createWildspaceClient();

const HomePage = () => {
  const [appState, setAppState] = useAppContext();
  const [,, navigate] = usePageContext();

  const { refereeInvitations } = appState;

  const editRoom = (invitation) => {
    console.log(invitation)
  };
  const createRoom = (roomId) => {
    const createdRoom = wildspaceClient.rooms.create(roomId);
    const invitation = { roomId, refereeSecret: createdRoom.refereeSecret() };
    setAppState({
      ...appState,
      refereeInvitations: [
        ...appState.refereeInvitations,
        invitation,
      ],
    });
    navigate('/room-editor', { roomId });
  };
  console.log(refereeInvitations);

  return [
    h('style', {} , style),
    h('h1', {}, 'Wildspace'),
    h('main', { class: 'home' }, [
      h('section', { class: 'left player' }, [
        //h('h2', {}, 'Play'),
        //h(JoinRoomForm),
        //h(RejoinRoomForm, { existingRoomId: 'exampleId', existingSecret: 'existingSecret' }),
      ]),
      h('section', { class: 'right referee '}, [
        h('h2', {}, 'Referee'),
        h(CreateRoomForm, { createRoom }),
        h(EditRoomForm, { editRoom }),
        h('hr'),
        h('h2', {}, 'Previous Rooms'),
        ...refereeInvitations.map(invitation => h(EditExistingRoomForm, { editRoom, invitation })),
      ]),
    ]),
  ]
};

export {
  HomePage,
};
