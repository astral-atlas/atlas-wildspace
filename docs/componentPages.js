// @flow strict
/*::
import type { Page } from "./entry";
import type { Component, ElementNode } from '@lukekaalim/act';
*/
import { h, useEffect, useRef, useState } from '@lukekaalim/act';
import { Document } from '@lukekaalim/act-rehersal';
import { createBezierAnimator, useAnimation } from '@lukekaalim/act-curve';

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
  });

  return h('div', { style: { width: '100%', height: '100%', overflow: 'hidden', border: '1px solid black', position: 'relative' }}, [
    h(GridLayout, { containerProps: { style: { width: '100%', height: '100%' }, ref: scrollElementRef }, rows }),
  ]);
};


/*::
type CompassMenuPosition =
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
  active?: CompassMenuPosition,
  contents: { [CompassMenuPosition]: ElementNode }
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

const contents = {
  center: 'Center Text',
  north: 'North Text',
  south: 'South Text'
};

export const Components/*: Component<{}>*/ = () => {
  const [activeCompassPosition, setActiveCompassPosition] = useState('center');

  return [
    h('h1', {}, 'Layout'),
    h('select', { onChange: e => setActiveCompassPosition(e.target.value) }, [
      Object.keys(positionVectors).map(position =>
        h('option', { value: position, selected: activeCompassPosition === position }, position))
    ]),
    h('div', { style: { width: '90px', height: '90px '} },
      h(GridLayout, { containerProps: { style: { width: '30px', height: '30px', position: 'relative' } }, rows: [
        [
          h('button', { onClick: () => setActiveCompassPosition('northwest') }, 'NW'),
          h('button', { onClick: () => setActiveCompassPosition('north') }, 'N'),
          h('button', { onClick: () => setActiveCompassPosition('northeast') }, 'NE'),
        ],
        [
          h('button', { onClick: () => setActiveCompassPosition('west') }, 'W'),
          h('button', { onClick: () => setActiveCompassPosition('center') }, 'C'),
          h('button', { onClick: () => setActiveCompassPosition('east') }, 'E'),
        ],
        [
          h('button', { onClick: () => setActiveCompassPosition('southwest') }, 'SW'),
          h('button', { onClick: () => setActiveCompassPosition('south') }, 'S'),
          h('button', { onClick: () => setActiveCompassPosition('southeast') }, 'SE'),
        ]
      ] })),
    h('div', { style: { width: '600px', height: '600px' } },
      h(CompassMenu, { active: activeCompassPosition, contents }))
    
  ];
};

export const componentPage/*: Page*/ = {
  link: { href: '/layout', name: 'Layout', children: [] },
  content: h(Document, {}, h(Components)),
};

export const componentsPages = [
  componentPage,
];