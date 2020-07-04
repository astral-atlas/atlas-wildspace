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
    h('h3', {}, room.roomId),
    h('p', { onChange: event => setRefereeSecret(event.currentTarget.value)}, room.refereeSecret),
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
  const addBackground = () => {
    const backgrounds = [
      ...backgrounds,
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
    const backgrounds = backgrounds.filter(background => background.id !== backgroundToRemove.id);
    setRoom({ ...room, backgrounds });
  };
  const updateBackgroundProperty = (backgroundToUpdate, propertyName) => (event) => {
    const backgrounds = backgrounds.map(background => {
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
    h('ul', { class: 'backgrounds-list' }, room.backgrounds.map(background => (
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

const EditorPanel = ({ cameraPosition, cursorPosition, room, setRoom }) => {
  return h('form', { class: 'editor-panel' }, [
    h(RoomEditorPanel, { room, setRoom }),
    h(CameraPanel, { cameraPosition, cursorPosition }),
    h(BackgroundPanel, { room, setRoom })
  ])
};

export {
  RoomEditorPanel,
  EditorPanel,
}