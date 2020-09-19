const { createWildspaceAPI } = require('./api.js');

const cli = () => {
  const [executable, script, ...args] = process.argv;
  const [port] = args;
  console.log(`Running Server on http://localhost:${port}`);
  createWildspaceAPI(port);
};

cli();