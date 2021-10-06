// @flow strict
/*:: import type { IdentityProof } from '@astral-atlas/sesame-models'; */
/*:: import type { RoomID, GameID } from '@astral-atlas/wildspace-models'; */
/*:: import type { Cast } from '@lukekaalim/cast'; */
import { castIdentityProof } from '@astral-atlas/sesame-models';
import { createNullableCaster, createObjectCaster } from '@lukekaalim/cast'
import { castRoomId, castGameId } from '@astral-atlas/wildspace-models';

/*::
export type StoredValue<T> = {
  get: () => T,
  set: T => void,
};
*/
export const createStoredValue = /*:: <T>*/(
  key/*: string*/,
  toValue/*: Cast<T>*/,
  defaultValue/*: T*/
)/*: StoredValue<T>*/ => {
  const get = () => {
    const valueOrNull = localStorage.getItem(key);
    if (!valueOrNull)
      return defaultValue;
    return toValue(JSON.parse(valueOrNull));
  };
  const set = (value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  return {
    get,
    set,
  };
};

export const identityStore/*: StoredValue<?{ proof: IdentityProof }>*/ = createStoredValue(
  'wildspace_identity',
  createNullableCaster(createObjectCaster({ proof: castIdentityProof })),
  null
);

export const roomStore/*: StoredValue<?{ roomId: RoomID, gameId: GameID }>*/ = createStoredValue(
  'wildpsace_room',
  createNullableCaster(createObjectCaster({ roomId: castRoomId, gameId: castGameId })),
  null
);
