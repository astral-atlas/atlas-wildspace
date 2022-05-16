// @flow strict
/*::
import type { Page } from "../index.js";
import type { Component, ElementNode } from '@lukekaalim/act';
import type { CubicBezierAnimation, TimeSpan } from '@lukekaalim/act-curve';
*/
import { h, useEffect, useMemo, useRef, useState } from '@lukekaalim/act';
import { Document, Markdown } from '@lukekaalim/act-rehersal';
import { useTimeSpan, maxSpan } from '@lukekaalim/act-curve';
import styles from './layouts.module.css';
import {
  calculateCubicBezierAnimationPoint,
  useAnimatedNumber,
} from "@lukekaalim/act-curve/bezier";
import { calculateSpanProgress } from "@lukekaalim/act-curve/schedule";

import layoutsText from './layouts.md?raw';
import {
  CompassLayout, CompassLayoutMinimap, CornersLayout,
  EditorButton,
  EditorCheckboxInput,
  EditorForm, EditorTextAreaInput, PopupOverlay, useCompassKeysDirection,
  useElementKeyboard, useKeyboardTrack, useKeyboardTrackEmitter
} from '@astral-atlas/wildspace-components';
import { Vector2 } from "three";

/*::
export type GridMenuProps = {
  rows: ElementNode[][],
  position: [number, number],
};

export type CubicBezier2DAnimation = {
  type: 'cubic-bezier-2d',
  x: CubicBezierAnimation,
  y: CubicBezierAnimation,
  max: TimeSpan,
};
export type CubicBezier2DPoint = {
  progress: [number, number],
  position: [number, number],
  velocity: [number, number],
  acceleration: [number, number],
};
*/

export const useAnimatedVector2 = (
  vector/*: [number, number]*/,
  initial/*: [number, number]*/ = [0, 0],
  impulse/*: number*/ = 0,
  duration/*: number*/ = 1000,
)/*: CubicBezier2DAnimation*/ => {
  const [x] = useAnimatedNumber(vector[0], initial[0], { duration, impulse });
  const [y] = useAnimatedNumber(vector[1], initial[1], { duration, impulse });

  const max = maxSpan([x.span, y.span]);

  return useMemo(() => {
    return { type: 'cubic-bezier-2d', x, y, max };
  }, [...vector]);
};
export const calculateBezier2DPoint = (
  anim/*: CubicBezier2DAnimation*/,
  now/*: DOMHighResTimeStamp*/
)/*: CubicBezier2DPoint*/ => {
    const x = calculateCubicBezierAnimationPoint(anim.x, now);
    const y = calculateCubicBezierAnimationPoint(anim.y, now);
    const progress = [x.progress, y.progress];
    const position = [x.position, y.position];
    const velocity = [x.velocity, y.velocity];
    const acceleration = [x.acceleration, y.acceleration];
    const point = {
      progress,
      position,
      velocity,
      acceleration
    };
    return point;
};
export const useBezier2DAnimation = (
  anim/*: CubicBezier2DAnimation*/,
  onAnimate/*: CubicBezier2DPoint => mixed*/,
  deps/*: mixed[]*/ = [],
) => {
  const span = maxSpan([anim.x.span, anim.y.span]);
  useTimeSpan(span, (now) => {
    const point = calculateBezier2DPoint(anim, now);
    onAnimate(point);
  }, [anim, ...deps]);
}

const GridLayout = ({ rows, containerProps }) => {
  return h('div', { ...containerProps }, [
    rows.map((row, rowIndex) =>
      row.map((element, columnIndex) =>
          h('div', { style: { width: '100%', height: '100%', position: 'absolute', left: `${columnIndex * 100}%`, top: `${rowIndex * 100}%` } }, element)))
  ]);
};

const ScrollingGridLayout/*: Component<GridMenuProps>*/ = ({ rows, position }) => {
  const scrollElementRef = useRef/*:: <?HTMLElement>*/();

  const anim = useAnimatedVector2(position, position, 3, 200);

  useBezier2DAnimation(anim, ({ position }) => {
    const { current: element } = scrollElementRef;
    if (!element)
      return;
    element.style.transform = `translate(${-position[0] * 100}%, ${-position[1] * 100}%)`
  }, []);

  return h('div', { style: { width: '100%', height: '100%', overflow: 'hidden', border: '1px solid black', position: 'relative' }}, [
    h(GridLayout, { containerProps: { style: { width: '100%', height: '100%' }, ref: scrollElementRef }, rows }),
  ]);
};


/*::
type CompassPosition =
  | 'center'
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'northeast'
  | 'northwest'
  | 'southeast'
  | 'southwest'

type CompassMenuProps = {
  active?: CompassPosition,
  contents: { [CompassPosition]: ElementNode }
}
*/

const positionVectors = {
  northwest:  [0, 0],
  north:      [1, 0],
  northeast:  [2, 0],

  west:       [0, 1],
  center:     [1, 1],
  east:       [2, 1],
  
  southwest:  [0, 2],
  south:      [1, 2],
  southeast:  [2, 2],
}

const CompassMenu/*: Component<CompassMenuProps>*/ = ({
  active = 'center',
  contents = {},
}) => {
  return h(ScrollingGridLayout, {
    rows: [
        [contents['northwest'], contents['north'],  contents['northeast']],
        [contents['west'],      contents['center'], contents['east']],
        [contents['southwest'], contents['south'],  contents['southeast']],
      ],
    position: positionVectors[active],
  });
};


const compassPositions/*: CompassPosition[][]*/ = [
  ['northwest', 'north',  'northeast'],
  ['west',      'center', 'east'],
  ['southwest', 'south',  'southeast'],
];
const compassAbbreviations = {
  northwest: 'NW',  north: 'N',   northeast: 'NE',
  west: 'W',        center: 'C',  east: 'E',
  southwest: 'SW',  south: 'S',   southeast: 'SE',
}

/*::
export type CompassButtonMenuProps = {
  onPositionClick?: CompassPosition => mixed,
  disabled?: { [CompassPosition]: boolean }
}
*/

const ColoredDemoBox = ({ name }) => {
  const color = useMemo(() => `hsl(${Math.random() * 255}, 50%, 70%)`, [name]);

  return h('div', { style: { width: '100%', height: '100%', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}, [
    h('p', { }, name)
  ])
}

const CompassButtonMenu/*: Component<CompassButtonMenuProps>*/ = ({ onPositionClick = _ => {}, disabled = {} }) => {
  const onClick = (position) => () => {
    onPositionClick(position);
  };
  return h('menu', { className: styles.compassButtonMenu }, [
    compassPositions.map(row =>
      row.map(position =>
        h('button', { onClick: onClick(position), disabled: disabled[position] || false }, compassAbbreviations[position])))
  ]);
}

const clampCompassVector = ([x, y]) => [
  Math.min(2, Math.max(0, x)),
  Math.min(2, Math.max(0, y)),
]
const addVector = (a, b) => [
  a[0] + b[0],
  a[1] + b[1]
]
const vectorToPosition = ([x, y]) => {
  return compassPositions[y][x]
}

export const Components/*: Component<{}>*/ = () => {
  const [activeCompassPosition, setActiveCompassPosition] = useState/*:: <CompassPosition>*/('center');

  const onKeyDown = (e) => {
    if (e.shiftKey) {
      setActiveCompassPosition(position => {
        const vector = positionVectors[position];
        switch (e.code) {
          case 'KeyD':
            return vectorToPosition(clampCompassVector(addVector(vector, [1, 0])));
          case 'KeyA':
            return vectorToPosition(clampCompassVector(addVector(vector, [-1, 0])));
          case 'KeyW':
            return vectorToPosition(clampCompassVector(addVector(vector, [0, -1])));
          case 'KeyS':
            return vectorToPosition(clampCompassVector(addVector(vector, [0, 1])));
          default:
            return position;
        }
      })
    }
  }

  return [
    h('select', { onChange: e => setActiveCompassPosition(e.target.value) }, [
      compassPositions.map((r, y) => r.map((p, x) =>
        h('option', { value: p, selected: activeCompassPosition === p }, `${p} (${x}, ${y})`))),
    ]),
    h(CompassButtonMenu, {
      onPositionClick: position => setActiveCompassPosition(position),
      disabled: { [(activeCompassPosition/*: string*/)]: true }
    }),
    h('div', { style: { width: '600px', height: '600px' }, tabIndex: 0, onKeyDown },
      h(CompassMenu, { active: activeCompassPosition, contents: Object.fromEntries(compassPositions.flat(1).map(p => [p, h(ColoredDemoBox, { name: p })])) }))
    
  ];
};

export const LayoutDemo/*: Component<>*/ = ({ children }) => {
  return h('div', { style: { position: 'relative', width: '100%', height: '512px', overflow: 'auto' } }, [
    h('div', {  style: {
      position: 'relative',
      width: '100%', height: '100%',
      maxWidth: '100%', maxHeight: '100%',
      border: '1px solid black', boxSizing: 'border-box',
      resize: 'both', overflow: 'hidden'
    } }, [
      children
    ]),
  ])
}

const CornersDemo = () => {
  return h(LayoutDemo, {}, [
    h(CornersLayout, {
      topLeft: 'topLeft',
      topRight: 'topRight',
      bottomLeft: 'bottomLeft',
      bottomRight: 'bottomRight',
    }),
  ]);
}

const DemoScreen = ({ children, backgroundColor }) => {
  return h('div', { classList: [styles.demoScreen], style: { backgroundColor } }, children)
}

const demoScreens = [
  {
    content: h(DemoScreen, { backgroundColor: `hsl(${Math.random() * 255}, 50%, 70%)` }, 'Center!'),
    position: new Vector2(0, 0),
    icon: 'C',
  },
  {
    content: h(DemoScreen, { backgroundColor: `hsl(${Math.random() * 255}, 50%, 70%)` }, 'Above!'),
    position: new Vector2(0, 1),
    icon: 'N',
  },
  {
    content: h(DemoScreen, { backgroundColor: `hsl(${Math.random() * 255}, 50%, 70%)` }, 'Left!'),
    position: new Vector2(-1, 0),
    icon: 'E',
  },
  {
    content: h(DemoScreen, { backgroundColor: `hsl(${Math.random() * 255}, 50%, 70%)` }, 'Bottom Right Corner!'),
    position: new Vector2(1, -1),
    icon: 'SW',
  },
]

const Compass2Demo = () => {
  const ref = useRef();
  const emitter = useElementKeyboard(ref);
  const track = useKeyboardTrack(emitter);
  const trackEmitter = useKeyboardTrackEmitter(track);

  const [direction, setDirection] = useCompassKeysDirection(trackEmitter, demoScreens)

  return h('div', { ref }, [
    h(CompassLayoutMinimap, {
      direction,
      screens: demoScreens,
      onScreenClick: screen => setDirection(screen.position)
    }),
    h(LayoutDemo, {}, [
      h(CompassLayout, {
        direction,
        screens: demoScreens,
      }),
    ])
  ]);
}

const PopupDemo = () => {
  const [visible, setVisible] = useState(true);

  return [
    h(LayoutDemo, {}, [
      h(EditorForm, {}, [
        h(EditorButton, { label: 'Summon Popup', onButtonClick: () => setVisible(true) })
      ]),
      h(PopupOverlay, {
        visible,
        onBackgroundClick: () => setVisible(false),
      }, h(EditorForm, {}, [
        h(EditorButton, { label: 'Close Popup', onButtonClick: () => setVisible(false) }),
        h(EditorTextAreaInput, { disabled: true })
      ]))
    ]
      ),
    h(EditorForm, {}, [
      h(EditorCheckboxInput, { checked: visible, onCheckedChange: visible => setVisible(visible), label: 'Visible' })
    ])
  ]
}

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'compass':
      return h(Components);
    case 'corners':
      return h(CornersDemo);
    case 'compass2':
      return h(Compass2Demo)
    case 'popup':
      return h(PopupDemo);
    default:
      throw new Error();
  }
};

const directives = {
  demo: Demo,
}

export const layoutsPage/*: Page*/ = {
  link: { href: '/layout', name: 'Layout', children: [] },
  content: h(Document, {}, h(Markdown, { text: layoutsText, directives })),
};

export const layoutsPages = [
  layoutsPage,
];