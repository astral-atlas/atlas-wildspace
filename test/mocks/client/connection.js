// @flow strict
/*::
import type { LibraryData } from "@astral-atlas/wildspace-models";
import type { UpdatesConnection } from "@astral-atlas/wildspace-client2";
*/

import { reduceMiniTheaterAction } from "@astral-atlas/wildspace-models";
import { v4 } from "uuid";

export const createMockMiniTheaterConnection = (
  getLibrary/*: () => LibraryData*/,
  onLibraryChange/*: LibraryData => mixed*/ = _ => {},
)/*: UpdatesConnection["miniTheater"]*/ => {
  const subscribers = new Set();
  const subscribe = (id, onEvent) => {
    const s = {
      id,
      onEvent,
    };
    subscribers.add(s);
    const library = getLibrary();
    const mt = library.miniTheaters.find(m => m.id === id);
    if (mt)
      onEvent(mt);

    return () => {
      subscribers.delete(s);
    };
  };
  const act = (aId, action) => {
    const l = getLibrary();

    const miniTheaters = l.miniTheaters
      .map(m => {
        if (m.id === aId)
          return { ...reduceMiniTheaterAction(action, m), version: v4() };
        return m;
      });

    const mt = miniTheaters.find(m => m.id === aId);
    if (mt)
      for (const { id, onEvent } of subscribers)
        if (aId === id)
          onEvent(mt);

    onLibraryChange({
      ...l,
      miniTheaters,
    })
  };
  const close = () => {

  };
  return {
    subscribe, act, close
  }
}

export const createMockUpdateConnection = (
  getLibrary/*: () => LibraryData*/,
  onLibraryChange/*: LibraryData => mixed*/ = _ => {},
)/*: UpdatesConnection*/ => {
  const miniTheater = createMockMiniTheaterConnection(getLibrary, onLibraryChange);
  return {
    miniTheater,
  };
}