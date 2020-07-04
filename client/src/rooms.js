const generatePassword = require('password-generator');

const createRoomClient = () => {
  const rooms = [];

  const create = async (roomId) => {
    if (rooms.find(room => room.id === roomId))
      throw new Error(`Room with id (${roomId}) already exists`);

    const newRoom = {
      id: roomId,
      turn: 0,
      refereeSecret: generatePassword(),
      backgrounds: [],
      players: [],
      monsters: [],
    };
    rooms.push(newRoom);
    return newRoom;
  };

  const get = async (roomId, refereeSecret) => {
    const room = rooms.find(room => room.id === roomId);
    if (!room)
      throw new Error(`Room with id (${roomId}) does not exist`);
    if (room.refereeSecret !== refereeSecret)
      throw new Error(`Room with id (${roomId}) does not accept the refereeSecret`);
    return room;
  };

  return {
    create,
    get,
  };
};

export {
  createRoomClient,
};
