// @flow strict
/*::
import type { GameID, RoomID } from "@astral-atlas/wildspace-models";
import type { Navigation } from "@lukekaalim/act-navigation";
*/

import { usePageQuery } from "./usePageQuery";
import { useMemo } from "@lukekaalim/act"

/*::
export type GameRoute =
  | {| page: 'game', path: '/prep', gameId: GameID |}
  | {| page: 'game', path: '/', gameId: ?GameID |};
export type RoomRoute =
  | {| page: 'room', path: '/room', gameId: GameID, roomId: RoomID, screen: string |}

export type Route =
  | GameRoute
  | RoomRoute

export type Router = {
  route: Route,
  setRoute: (nextRoute: Route, title?: string) => void,
};
*/

const calculateRoute = (pathname, { gameId, roomId, screen }) => {
  const defaultRoute = { page: 'game', path: '/', gameId };
  switch (pathname) {
    case '/':
    default:
      return defaultRoute;
    case '/prep':
      if (!gameId)
        return defaultRoute;
      return { page: 'game', path: '/prep', gameId };
    case '/room':
      if (!gameId || !roomId)
        return defaultRoute;
      return { page: 'room', path: '/room', gameId, roomId, screen: screen || 'lobby'  }
  }
}
const createURLRouteParams = (route) => {
  switch (route.path) {
    case '/':
      return new URLSearchParams([
        route.gameId && ['gameId', route.gameId] || null,
      ].filter(Boolean));
    case '/prep':
        return new URLSearchParams([
          ['gameId', route.gameId],
        ].filter(Boolean));
    case '/room':
      return new URLSearchParams([
        ['gameId', route.gameId],
        ['roomId', route.roomId],
        route.screen && ['screen', route.screen] || null,
      ].filter(Boolean));
  }
}

export const useRouter = (navigation/*: Navigation*/)/*: Router*/ => {
  const [gameId] = usePageQuery('gameId', navigation);
  const [roomId] = usePageQuery('roomId', navigation);
  const [screen] = usePageQuery('screen', navigation);

  return useMemo(() => {
    const route = calculateRoute(navigation.location.pathname, { gameId, roomId, screen });

    const setRoute = (nextRoute, title) => {
      const url = new URL(navigation.location.href);
      url.search = createURLRouteParams(nextRoute).toString();
      url.pathname = nextRoute.path;
      if (navigation.location.href === url.href)
        return;
      navigation.navigate(url, title);
    }

    return { route, setRoute };
  }, [navigation, gameId, roomId, screen])
}