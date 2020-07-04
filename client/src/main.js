const { createRoomClient } = require('./rooms');

const createWildspaceClient = () => {
  const rooms = createRoomClient();

  return {
    rooms,
  };
};

module.exports = {
  createWildspaceClient,
};
