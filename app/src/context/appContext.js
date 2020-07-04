import { createContext, h } from 'preact';
import { useContext } from 'preact/hooks';
import { useStoredState } from '../hooks/useStoredState';

const initialAppState = {
  refereeInvitations: [],
  playerInvitations: [],
};

const AppContext = createContext(null);

const AppContextProvider = ({ children }) => {
  const [appState, setAppState] = useStoredState('app_state', initialAppState);
  return h(AppContext.Provider, { value: [appState, setAppState] }, children);
};

const useAppContext = () => {
  const [appState, useAppState] = useContext(AppContext);

  return [appState, useAppState];
};

export {
  AppContextProvider,
  useAppContext,
};
