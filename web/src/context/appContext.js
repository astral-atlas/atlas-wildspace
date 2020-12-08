// @flow strict
/*:: import type { Node, Context } from 'preact'; */
/*:: import type { User, PlayerID, GameMasterID, GameID } from '@astral-atlas/wildspace-models'; */
/*:: import type { SelfDetails } from '@astral-atlas/wildspace-client'; */
import { toUser, toGameID } from '@astral-atlas/wildspace-models';
import { toNumber, toObject, toString } from '@astral-atlas/wildspace-models/casting';
import { createContext, h } from 'preact';
import { useContext } from 'preact/hooks';
import { useStoredState } from '../hooks/useStoredState';

/*::
type Credentials = {|
  secret: string,
  type: 'player' | 'game-master',
  id: PlayerID | GameMasterID
|};

type UserState = {|
  credentials: ?Credentials,
  selfDetails: SelfDetails,
|};
type GameState = {|
  activeGameId: null | GameID,
|};
type State = {|
  user: UserState,
  game: GameState,
|};
type Action =
  | { type: 'empty' }
  | { type: 'set-active-game', gameId: null | GameID }
  | { type: 'update-creds', newCredentials: Credentials }
  | { type: 'update-self', self: SelfDetails }
  | { type: 'logout' }
type AppStoreProps = {
  children: Node,
};
*/
const toCredentialType = (value)/*: 'player' | 'game-master'*/ => {
  const string = toString(value);
  switch (string) {
    case 'player':
      return 'player';
    case 'game-master':
      return 'game-master';
    default:
      throw new TypeError();
  }
}

const toCredentials = (value)/*: Credentials*/ => {
  const object = toObject(value);
  return {
    id: toString(object.id),
    type: toCredentialType(object.type),
    secret: toString(object.secret),
  };
};

const toSelfDetails = (value)/*: SelfDetails*/ => {
  const object = toObject(value);
  switch (toString(object.type)) {
    case 'logged-in':
      return {
        type: 'logged-in',
        user: toUser(object.user),
      }
    case 'invalid-user':
      return {
        type: 'invalid-user',
      };
    default:
      throw new TypeError();
  }
}

const toUserState = (value)/*: UserState*/ => {
  const object = toObject(value);
  return {
    credentials: object.credentials ? toCredentials(object.credentials) : null,
    selfDetails: toSelfDetails(object.selfDetails),
  };
};
const toGameState = (value)/*: GameState*/ => {
  const object = toObject(value);
  return {
    activeGameId: object.activeGameId ? toGameID(object.activeGameId) : null,
  };
};

const toState = (value/*: mixed*/)/*: State*/ => {
  const object = toObject(value);
  return {
    user: toUserState(object.user),
    game: toGameState(object.game),
  };
};

const emptyState/*: State*/ = {
  user: {
    credentials: null,
    selfDetails: { type: 'invalid-user' }
  },
  game: {
    activeGameId: null,
  }
};

const reducer = (state/*: State*/, action/*: Action*/)/*: State*/ => {
  switch (action.type) {
    case 'set-active-game':
      return {
        ...state,
        game: {
          ...state.game,
          activeGameId: action.gameId,
        },
      };
    case 'logout':
      return {
        ...state,
        game: {
          ...state.game,
          activeGameId: null,
        },
        user: {
          ...state.user,
          credentials: null,
        },
      };
    case 'update-self':
      return {
        ...state,
        user: {
          ...state.user,
          selfDetails: action.self,
        },
      };
    case 'update-creds':
      return {
        ...state,
        user: {
          ...state.user,
          credentials: action.newCredentials,
        }
      };
    case 'empty':
    default:
      return state;
  }
};

const AppStoreContext/*: Context<?[State, (action: Action) => void]>*/ = createContext(null);

const AppStore = ({ children }/*: AppStoreProps*/)/*: Node*/ => {
  const [state, updateState] = useStoredState('state', emptyState, toState);
  const dispatch = (action/*: Action*/) => {
    const newState = reducer(state, action);
    updateState(newState);
  };
  return h(AppStoreContext.Provider, { value: [state, dispatch] }, children);
};

const useStore = ()/*: [State, (action: Action) => void]*/ => {
  const storeContext = useContext(AppStoreContext);
  if (!storeContext)
    throw new Error(`Missing store context. Did you forget to mount to AppStore?`);
  
  return storeContext;
};

export {
  useStore,
  AppStore,
  AppStoreContext,
};
