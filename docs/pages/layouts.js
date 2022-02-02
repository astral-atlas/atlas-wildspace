// @flow strict
/*::
import type { Page } from "../index.js";
import type { Component, ElementNode } from '@lukekaalim/act';
*/
import { h, useEffect, useMemo, useRef, useState } from '@lukekaalim/act';
import { Document } from '@lukekaalim/act-rehersal';
import { createBezierAnimator, useAnimation } from '@lukekaalim/act-curve';
import styles from './layouts.module.css';

/*::
export type GridMenuProps = {
  rows: ElementNode[][],
  position: [number, number],
};
*/

/*::
export type Vector2Animator = {
  getPosition: (now: DOMHighResTimeStamp) => [number, number],
  isDone: (now: DOMHighResTimeStamp) => boolean,
  update: (position: [number, number], now: DOMHighResTimeStamp) => void,
}
*/

const createVector2Animator = (initalPosition, initialTarget)/*: Vector2Animator*/ => {
  const x = createBezierAnimator({ initial: { from: initalPosition[0], to: initialTarget[0], velocity: 0 } });
  const y = createBezierAnimator({ initial: { from: initalPosition[1], to: initialTarget[1], velocity: 0 } });

  const update = (nextTarget, now) => {
    x.update(nextTarget[0], now);
    y.update(nextTarget[1], now);
  };
  const getPosition = (now) => {
    return [x.getPosition(now), y.getPosition(now)];
  };
  const isDone = (now) => {
    return x.isDone(now) && y.isDone(now);
  }
  return { update, getPosition, isDone };
};

const useVector2Curve = (target, onAnimate, { initalPosition = [0, 0], initialTarget = [0, 0] } = {}) => {
  const [animator] = useState/*:: <Vector2Animator>*/(() => createVector2Animator(initalPosition, initialTarget));

  useEffect(() => {
    animator.update(target, performance.now());
  }, [...target]);
  useAnimation((now) => {
    const position = animator.getPosition(now);
    onAnimate(position);
    return animator.isDone(now);
  }, [...target])
};

const GridLayout = ({ rows, containerProps }) => {
  return h('div', { ...containerProps }, [
    rows.map((row, rowIndex) =>
      row.map((element, columnIndex) =>
          h('div', { style: { width: '100%', height: '100%', position: 'absolute', left: `${columnIndex * 100}%`, top: `${rowIndex * 100}%` } }, element)))
  ]);
};

const ScrollingGridLayout/*: Component<GridMenuProps>*/ = ({ rows, position }) => {
  const scrollElementRef = useRef/*:: <?HTMLElement>*/();
  
  useVector2Curve(position, position => {
    const { current: element } = scrollElementRef;
    if (!element)
      return;
    element.style.transform = `translate(${-position[0] * 100}%, ${-position[1] * 100}%)`
  }, { initalPosition: position, initialTarget: position });

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