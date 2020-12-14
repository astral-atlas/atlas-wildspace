// @flow strict
const { createWildspaceAPI } = require('./api.js');

const cli = async () => {
  const [executable, script, ...args] = process.argv;
  const [port] = args;
  const [httpServer] = await createWildspaceAPI();
  httpServer.listen(port, () => {
    console.log(`Running Server on http://localhost:${port}`);
  })
};

cli();