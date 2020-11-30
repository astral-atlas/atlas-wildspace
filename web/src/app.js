import { h } from 'preact';
import { PageContextProvider, usePageContext } from './context/pageContext';
import { AppContextProvider } from './context/appContext';
import { WildspaceProvider } from './context/wildspaceContext';

import { HomePage } from './pages/home2';
import { NotFoundPage } from './pages/notFound';
//import { RoomPage } from './pages/room';
//import { RoomEditor } from './pages/roomEditor';

const Router = () => {
  const [page, params] = usePageContext();

  switch (page) {
    case '/':
      return h(HomePage);
    default:
      return h(NotFoundPage);
  }
}

const App = ({ initialPage, initialParams }) => {
  return (
    h(PageContextProvider, { initialPage, initialParams },
      h(AppContextProvider, {}, 
        h(WildspaceProvider, {}, 
          h(Router)
        )
      )
    )
  );
};

export {
  App,
};
