import { useState } from 'preact/hooks';

/**
 * Like UseState, but persists in local storage as JSON under a key
 * @param {*} key 
 * @param {*} initialState 
 */
const useStoredState = (key, initialState) => {
  const storedState = JSON.parse(localStorage.getItem(key) || JSON.stringify(initialState));
  const [state, setMemoryState] = useState(storedState);
  const setState = (newState) => {
    localStorage.setItem(key, JSON.stringify(newState));
    setMemoryState(newState);
  }
  return [state, setState];
};

export {
  useStoredState,
};
