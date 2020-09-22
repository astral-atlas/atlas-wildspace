const key = require('key-creator');

const createPlayerRoomClient = (baseURL) => {
  const read = async (roomId, playerSecret) => {
    const url = new URL('/rooms/player', baseURL);
    url.searchParams.append('roomId', roomId);
    const headers = {
      authorization: `secret ${playerSecret}`,
    };
    const response = await fetch(url, { headers, method: 'GET' });
    if (response.ok)
      return await response.json();
    throw new Error(await response.text());
  };

  return {
    read,
  };
};

const createRefereeRoomClient = (baseURL) => {
  const create = async (roomId) => {
    const url = new URL('/rooms/referee', baseURL);
    const body = JSON.stringify({ roomId });
    const response = await fetch(url, { body, method: 'POST' });
    if (response.ok)
      return await response.json();
    throw new Error(await response.text());
  };

  const read = async (roomId, refereeSecret) => {
    const url = new URL('/rooms/referee', baseURL);
    url.searchParams.append('roomId', roomId);
    const headers = {
      authorization: `secret ${refereeSecret}`,
    };
    const response = await fetch(url, { headers, method: 'GET' });
    if (response.ok)
      return await response.json();
    throw new Error(await response.text());
  };

  const update = async (roomId, refereeSecret, updatedRoom) => {
    const url = new URL('/rooms/referee', baseURL);
    url.searchParams.append('roomId', roomId);
    const headers = {
      authorization: `secret ${refereeSecret}`,
    };
    const body = JSON.stringify(updatedRoom);
    const response = await fetch(url, { body, headers, method: 'PUT' });
    if (response.ok)
      return await response.json();
    throw new Error(await response.text());
  };

  return {
    create,
    read,
    update,
  };
};

const createRoomClient = (baseURL) => {
  const player = createPlayerRoomClient(baseURL);
  const referee = createRefereeRoomClient(baseURL);

  return {
    player,
    referee,
  };
};

module.exports = {
  createRoomClient,
}