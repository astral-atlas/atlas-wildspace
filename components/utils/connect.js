// @flow strict
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";

export const useConnection = /*:: <T>*/(
  createConnection/*: (T => void) => Promise<? (() => mixed)>*/, initial/*: T*/
)/*: T*/ => {
  const [state, setState] = useState(initial);
  useEffect(() => {
    const connectionPromise = createConnection(setState);

    return async () => {
      const connection = await connectionPromise;
      connection && connection()
    };
  }, [])

  return state;
}