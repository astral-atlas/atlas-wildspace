const createJSONStorage = (stateKey, initialState) => {
  const set = (state) => {
    localStorage.setItem(stateKey, JSON.stringify(state, null, 2));
  };
  const get = () => {
    const item = localStorage.getItem(stateKey);
    if (!item)
      return initialState;
    return JSON.parse(item);
  };
  return { get, set };
};

export {
  createJSONStorage,
};