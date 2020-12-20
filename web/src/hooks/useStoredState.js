// @flow strict
import { useState, useMemo } from 'preact/hooks';

/**
 * Like UseState, but persists in local storage as JSON under a key
 * @param {*} key 
 * @param {*} initialState 
 */
const useStoredState = /*::<T: {}>*/(key/*: string*/, initialState/*: T*/, castFunction/*: mixed => T*/)/*: [T, T => void]*/ => {
  const storedState = useMemo(
    () => {
      try {
        const storedItem = localStorage.getItem(key);
        if (!storedItem)
          return initialState;
        const parsedItem = JSON.parse(storedItem);
        return castFunction(parsedItem);
      } catch (error) {
        console.log(error);
        return initialState;
      }
    },
    [key, initialState]
  );
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
