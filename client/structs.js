// @flow strict
const { createStructures } = require('@astral-atlas/wildspace-models');
const superstruct = require('superstruct');

const { game, fateAspect, error } = createStructures(superstruct);

module.exports = {
  game,
  fateAspect,
  error,
};
