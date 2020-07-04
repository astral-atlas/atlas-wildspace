const setRefereeSecret = (roomId, secret) => {
  const refereeSecrets = localStorage.getItem('refereeSecrets') || {};
  localStorage.setItem('refereeSecrets', {
    ...refereeSecrets,
    [roomId]: secret,
  });
};

const getRefereeSecret = (room) => {

};
