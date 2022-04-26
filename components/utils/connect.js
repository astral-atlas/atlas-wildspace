// @flow strict
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";

export const useConnection = (
  createConnection/*: () => Promise<? (() => mixed)>*/,
  deps/*: mixed[]*/ = []
)/*: void*/ => {
  
  useEffect(() => {
    const connectionPromise = createConnection();

    return async () => {
      const connection = await connectionPromise;
      connection && connection()
    };
  }, deps)

}