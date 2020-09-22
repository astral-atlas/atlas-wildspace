import { h } from 'preact';
import { v4 as uuid } from 'uuid';

const RoomEditorPanel = ({ room, setRoom }) => {
  const setRefereeSecret = (refereeSecret) => {
    setRoom({
      ...room,
      refereeSecret
    })
  };
  return [
    h('h3', {}, room.id),
    h('label', {}, [
      'Referee Secret',
      h('input', { type: 'text', onChange: event => setRefereeSecret(event.currentTarget.value), value: room.refereeSecret }),
    ])
  ]
};

const CameraPanel = ({ cameraPosition, cursorPosition }) => {
  return h('details', {}, [
    h('summary', {}, 'Camera Information'),
    h('label', {}, [
      'Camera Position',
      h('pre', {}, JSON.stringify(cameraPosition)),
    ]),
    h('label', {}, [
      'Cursor Position',
      h('pre', {}, JSON.stringify(cursorPosition)),
    ]),
    h('label', {}, [
      'Cursor Grid Index',
      h('pre', {}, JSON.stringify({
        x: Math.floor((cameraPosition.x + cursorPosition.x) / 75),
        y: Math.floor((cameraPosition.y + cursorPosition.y) / 75)
      })),
    ])
  ]);
}

const BackgroundPanel = ({ room, setRoom }) => {
  const addBackground = (event) => {
    const backgrounds = [
      ...room.backgrounds,
      {
        id: uuid(),
        src: 'https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png',
        x: 0, y: 0,
        height: 2, width: 2
      }
    ];
    setRoom({ ...room, backgrounds });
  };
  const removeBackground = (backgroundToRemove) => () => {
    const backgrounds = room.backgrounds.filter(background => background.id !== backgroundToRemove.id);
    setRoom({ ...room, backgrounds });
  };
  const updateBackgroundProperty = (backgroundToUpdate, propertyName) => (event) => {
    const backgrounds = room.backgrounds.map(background => {
      if (background.id !== backgroundToUpdate.id)
        return background;
      return {
        ...background,
        [propertyName]: event.currentTarget.value,
      };
    })
    setRoom({ ...room, backgrounds });
  }
  return h('details', {}, [
    h('summary', {}, 'Backgrounds'),
    h('input', { type: 'button', value: 'Add new Background', onClick: addBackground }),
    h('ul', { class: 'editor-list' }, room.backgrounds.map(background => (
      h('li', {}, [
        h('label', {}, ['ID', h('pre', {}, background.id)]),
        h('label', {}, [
          'Source',
          h('input', { type: 'text', value: background.src, onInput: updateBackgroundProperty(background, 'src') })
        ]),
        h('label', {}, [
          'X',
          h('input', { type: 'number', value: background.x, onInput: updateBackgroundProperty(background, 'x') })
        ]),
        h('label', {}, [
          'Y',
          h('input', { type: 'number', value: background.y, onInput: updateBackgroundProperty(background, 'y') })
        ]),
        h('label', {}, [
          'Height',
          h('input', { type: 'number', value: background.height, onInput: updateBackgroundProperty(background, 'height') })
        ]),
        h('label', {}, [
          'Width',
          h('input', { type: 'number', value: background.width, onInput: updateBackgroundProperty(background, 'width') })
        ]),
        h('input', { type: 'button', value: 'Remove Background', onClick: removeBackground(background) }, 'Remove Background')
      ])
    )))
  ]);
};

const PlayerPanel = ({ room, setRoom }) => {
  const addPlayer = () => {
    const players = [
      ...room.players,
      {
        id: uuid(),
        name: 'Unnamed Player',
        image: 'https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png',
        x: 0, y: 0,
        secret: uuid(),
        height: 1, width: 1
      }
    ];
    setRoom({ ...room, players });
  };
  const removePlayer = (playerToRemove) => () => {
    const players = room.players.filter(player => player.id !== playerToRemove.id);
    setRoom({ ...room, players });
  };
  const updatePlayerProperty = (playerToUpdate, property) => (event) => {
    const players = room.players.map(player => {
      if (player.id !== playerToUpdate.id)
        return player;
      return {
        ...player,
        [property]: event.currentTarget.value,
      };
    })
    setRoom({ ...room, players });
  }
  return h('details', {}, [
    h('summary', {}, 'Players'),
    h('input', { type: 'button', value: 'Add new Player', onClick: addPlayer }),
    h('ul', { class: 'editor-list' }, room.players.map(player => (
      h('li', {}, [
        h('label', {}, ['ID', h('pre', {}, player.id)]),
        h('label', {}, [
          'Name',
          h('input', { type: 'text', value: player.name, onInput: updatePlayerProperty(player, 'name') })
        ]),
        h('label', {}, [
          'Image',
          h('input', { type: 'text', value: player.image, onInput: updatePlayerProperty(player, 'image') })
        ]),
        h('label', {}, [
          'Secret',
          h('input', { type: 'text', value: player.secret, onInput: updatePlayerProperty(player, 'secret') })
        ]),
        h('label', {}, [
          'X',
          h('input', { type: 'number', value: player.x, onInput: updatePlayerProperty(player, 'x') })
        ]),
        h('label', {}, [
          'Y',
          h('input', { type: 'number', value: player.y, onInput: updatePlayerProperty(player, 'y') })
        ]),
        h('label', {}, [
          'Height',
          h('input', { type: 'number', value: player.height, onInput: updatePlayerProperty(player, 'height') })
        ]),
        h('label', {}, [
          'Width',
          h('input', { type: 'number', value: player.width, onInput: updatePlayerProperty(player, 'width') })
        ]),
        h('input', { type: 'button', value: 'Remove Player', onClick: removePlayer(player) }, 'Remove Player')
      ])
    )))
  ]);
};

const MonsterPanel = ({ room, setRoom }) => {

};

const EditorPanel = ({ cameraPosition, cursorPosition, room, setRoom }) => {
  return h('form', { class: 'editor-panel' }, [
    h(RoomEditorPanel, { room, setRoom }),
    h(CameraPanel, { cameraPosition, cursorPosition }),
    h(PlayerPanel, { room, setRoom }),
    h(BackgroundPanel, { room, setRoom })
  ])
};

export {
  RoomEditorPanel,
  EditorPanel,
}