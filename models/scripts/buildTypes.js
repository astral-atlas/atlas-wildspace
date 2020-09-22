// @flow strict
const { writeFile, rmdir, mkdir } = require('fs').promises;
const { toFlowDocument } = require('@lukekaalim/schema');

const { models } = require('../main');

const build = async () => {
  try {
    // $FlowFixMe since the flow libs don't have recursive: true yet
    await rmdir(__dirname + '/../build', { recursive: true });
    await mkdir(__dirname + '/../build', { recursive: true });
    await writeFile(__dirname + '/../build/types.flow.js', toFlowDocument(models));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

build();