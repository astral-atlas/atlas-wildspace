// @flow strict
/*:: import type { SetValue } from '@lukekaalim/act'; */
/*:: import type { JSONValue, Cast } from '@lukekaalim/cast'; */
/*:: import type { StoredValue } from '../lib/storage.js'; */
import { useMemo, useState } from '@lukekaalim/act';
import { stringify, parse } from '@lukekaalim/cast';

export const useLocalStorage = /*:: <T: JSONValue>*/(
  key/*: string*/,
  defaultValue/*: T*/,
  toValue/*: Cast<T>*/,
)/*: [T, (v: (T => T)) => void]*/ => {
  const initialValue = useMemo(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? toValue(parse(item)) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }, [])
  const [storedValue, setStoredValue] = useState(initialValue);

  const setValue = updater => {
    try {
      const valueToStore = updater(storedValue);
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

export const useStoredValue = /*:: <T>*/(store/*: StoredValue<T>*/)/*: [T, SetValue<T>]*/ => {
  const initialValue = useMemo(() => store.get(), [])
  const [storedValue, setStoredValue] = useState(initialValue);

  const setValue = updater => {
    const value = typeof updater === 'function' ? (updater/*: any*/)(storedValue) : updater;
    store.set(value);
    setStoredValue(value);
  };

  return [storedValue, setValue];
};
