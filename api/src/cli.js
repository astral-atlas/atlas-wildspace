const { createWildspaceAPI } = require('./api.js');

const cli = () => {
  const [executable, script, ...args] = process.argv;
  const [port] = args;
  const server = createWildspaceAPI();
  server.listen(port, () => {
    console.log(`Running Server on http://localhost:${port}`);
  })
};

cli();