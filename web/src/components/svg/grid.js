import { h } from 'preact';

const Grid = ({ x = 0, y = 0, scale }) => {
  return [
    h('defs', {}, [
      h('pattern', { x, y, id: 'smallGrid', width: scale, height: scale, patternUnits: 'userSpaceOnUse' }, [
        h('path', {
          d: `M ${scale} 0 L 0 0 0 ${scale} ${scale}`,
          fill: 'none',
          stroke: 'grey',
          strokeWidth: '1',
        })
      ]),
      h('pattern', { id: 'grid', width: 1, height: 1 }, [
        h('rect', { width: 1, height: 1, fill: 'url(#smallGrid)' })
      ])
    ]),
    h('rect', { width: `100%`, height: `100%`, fill: 'url(#smallGrid)' })
  ]
};

export {
  Grid,
};
