// @flow strict
import { h, Fragment, } from 'preact';
import { useErrorBoundary } from 'preact/hooks';

/*:: import type { StyleSheet } from './lib/style'; */
import { cssClass, cssStylesheet, renderStyleSheet } from './lib/style';
import { PageContextProvider, usePageContext } from './context/pageContext';
import { AppStore } from './context/appContext';
import { Style } from './components/style';
import { WildspaceProvider } from './context/wildspaceContext';

import { StorePage } from './pages/store';
import { HomePage } from './pages/home';
import { CanvasPage } from './pages/canvas';
import { NotFoundPage } from './pages/notFound';
import { AssetPage } from './pages/assets';

import { Header } from './components/header';
import { Footer } from './components/footer';
import { Page } from './components/page';
//import { RoomPage } from './pages/room';
//import { RoomEditor } from './pages/roomEditor';


const Router = () => {
  const [page, params] = usePageContext();

  switch (page) {
    case '/store':
      return h(Page, {}, h(StorePage));
    case '/canvas':
      return h(Page, {}, h(CanvasPage));
    case '/assets':
      return h(Page, {}, h(AssetPage));
    case '/':
    case '':
      return h(Page, {}, h(HomePage));
    default:
      return h(Page, {}, h(NotFoundPage));
  }
}

const App = ({ initialPage, initialParams }) => {
  return h(Fragment, {}, [
    h(Style),
    h(PageContextProvider, { initialPage, initialParams },
      h(AppStore, {}, 
        h(WildspaceProvider, {}, 
          h(Router)
        )
      )
    )
  ]);
};

export {
  App,
};
