import { h } from 'preact';
import { CreateRoomForm, EditRoomForm, EditExistingRoomForm } from '../components/entry/referee';
import { JoinRoomForm } from '../components/entry/player';
import { useAppContext } from '../context/appContext';
import { usePageContext } from '../context/pageContext';
import { useWildspaceClient } from '../context/wildspaceContext';

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


const HomePage = () => {
  const [appState, setAppState] = useAppContext();
  const [,, navigate] = usePageContext();
  const wildspaceClient = useWildspaceClient();

  const editRoom = async (invitationToEdit) => {
    setAppState({
      ...appState,
      refereeInvitations: [
        ...appState.refereeInvitations.filter(invitation => invitation.roomId !== invitationToEdit.roomId),
        invitationToEdit,
      ],
    });
    navigate('/room-editor', { roomId: invitationToEdit.roomId });
  };
  const createRoom = async (roomId) => {
    const createdRoom = await wildspaceClient.rooms.referee.create(roomId);
    const invitation = { roomId, refereeSecret: createdRoom.refereeSecret };
    setAppState({
      ...appState,
      refereeInvitations: [
        ...appState.refereeInvitations,
        invitation,
      ],
    });
    navigate('/room-editor', { roomId });
  };
  const forgetRoom = (invitationToForget) => () => {
    setAppState({
      ...appState,
      refereeInvitations: appState.refereeInvitations.filter(invitation => invitation.roomId !== invitationToForget.roomId),
    });
  };
  const joinRoom = (invitation) => {
    setAppState({
      ...appState,
      playerInvitations: [
        ...appState.playerInvitations,
        invitation,
      ],
    });
    navigate('/room', { roomId : invitation.roomId });
  };

  return [
    h('style', {} , style),
    h('h1', {}, 'Wildspace'),
    h('main', { class: 'home' }, [
      h('section', { class: 'left player' }, [
        h('h2', {}, 'Play'),
        h(JoinRoomForm, { joinRoom }),
        //h(RejoinRoomForm, { existingRoomId: 'exampleId', existingSecret: 'existingSecret' }),
      ]),
      h('section', { class: 'right referee '}, [
        h('h2', {}, 'Referee'),
        h(CreateRoomForm, { createRoom }),
        h(EditRoomForm, { editRoom }),
        ...(appState.refereeInvitations.length > 0 ? ([
          h('hr'),
          h('h2', {}, 'Previous Rooms'),
          ...appState.refereeInvitations.map(invitation =>
            h(EditExistingRoomForm, { forgetRoom: forgetRoom(invitation), editRoom, invitation })
          ),
        ]) : []),
      ]),
    ]),
  ]
};

export {
  HomePage,
};
