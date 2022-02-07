// @flow strict
/*::
import type { Page } from "../index.js";
import type { Component, ElementNode } from '@lukekaalim/act';
import type { CubicBezierAnimation, TimeSpan } from '@lukekaalim/act-curve';
*/
import { h, useEffect, useMemo, useRef, useState } from '@lukekaalim/act';
import { Document } from '@lukekaalim/act-rehersal';
import { useTimeSpan, maxSpan } from '@lukekaalim/act-curve';
import styles from './layouts.module.css';
import {
  calculateCubicBezierAnimationPoint,
  useAnimatedNumber,
} from "@lukekaalim/act-curve/bezier";
import { calculateSpanProgress } from "@lukekaalim/act-curve/schedule";

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

  const anim = useAnimatedVector2(position, position, 3);

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

export const Components/*: Component<{}>*/ = () => {
  const [activeCompassPosition, setActiveCompassPosition] = useState/*:: <CompassPosition>*/('center');

  return [
    h('h1', {}, 'Layout'),
    h('select', { onChange: e => setActiveCompassPosition(e.target.value) }, [
      compassPositions.map((r, y) => r.map((p, x) =>
        h('option', { value: p, selected: activeCompassPosition === p }, `${p} (${x}, ${y})`))),
    ]),
    h(CompassButtonMenu, {
      onPositionClick: position => setActiveCompassPosition(position),
      disabled: { [(activeCompassPosition/*: string*/)]: true }
    }),
    h('div', { style: { width: '600px', height: '600px' } },
      h(CompassMenu, { active: activeCompassPosition, contents: Object.fromEntries(compassPositions.flat(1).map(p => [p, h(ColoredDemoBox, { name: p })])) }))
    
  ];
};

export const layoutsPage/*: Page*/ = {
  link: { href: '/layout', name: 'Layout', children: [] },
  content: h(Document, {}, h(Components)),
};

export const layoutsPages = [
  layoutsPage,
];