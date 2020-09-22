// @flow strict
const s = require('@lukekaalim/schema');

const starSign = s.define('StarSign', 'An aspect of Fate based around Stars and Constellations', s.object([
  ['id', s.define('StarSignID', 'Unique ID of FateAspect', s.string())],
  ['name', s.string()],
  ['subtitle', s.string()],
  ['description', s.nameSchema('Description', 'Markdown-formatted description', s.string())],
  ['stars', s.array(s.define(
    'StarName',
    'The name of a star that is part of a star sign',
    s.string(),
  ))],
]));

const readingStone = s.define('ReadingStone', 'An aspect of Fate based around Refracted Light and Stones', s.object([
  ['id', s.define('ReadingStoneID', 'Unique ID of Reading Stone', s.string())],
  ['name', s.string()],
  ['subtitle', s.string()],
  ['description', s.nameSchema('Description', 'Markdown-formatted description', s.string())],
  ['stones', s.array(s.define(
    'StoneName',
    'The name of a stone that was cast as part of the Reading Stone', 
    s.string(),
  ))],
  ['refractions', s.array(s.define(
    'RefractionName',
    'The name of a refraction target that was cast as part of the Reading Stone',
    s.string()
  ))],
]));

const fateAspect = s.define('FateAspect', 'An aspect of Fate grants special powers to characters aligned to it', s.union([
  s.object([
    ['type', s.literal('star-sign')],
    ['starSign', starSign]
  ]),
  s.object([
    ['type', s.literal('reading-stone')],
    ['readingStone', readingStone]
  ]),
]));

module.exports = {
  fateAspect,
  starSign,
  readingStone,
};
