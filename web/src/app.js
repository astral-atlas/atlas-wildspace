import { h, Fragment, } from 'preact';
import { useErrorBoundary } from 'preact/hooks';
import { PageContextProvider, usePageContext } from './context/pageContext';
import { AppStore } from './context/appContext';
import { Style } from './components/style';
import { WildspaceProvider } from './context/wildspaceContext';

import { StorePage } from './pages/store';
import { HomePage } from './pages/home';
import { CanvasPage } from './pages/canvas';
import { NotFoundPage } from './pages/notFound';
import { Header } from './components/header';
//import { RoomPage } from './pages/room';
//import { RoomEditor } from './pages/roomEditor';

const Page = ({ children }) => {
  const [error] = useErrorBoundary();

  if (error)
    console.error(error);

  return h(Fragment, {}, [
    h(Style),
    h(Header),
    !error && children,
    error && h('pre', {}, error.message),
    error && h('pre', {}, error.stack)
  ]);
};

const Router = () => {
  const [page, params] = usePageContext();

  switch (page) {
    case '/store':
      return h(Page, {}, h(StorePage));
    case '/canvas':
      return h(Page, {}, h(CanvasPage));
    case '/':
    case '':
      return h(Page, {}, h(HomePage));
    default:
      return h(Page, {}, h(NotFoundPage));
  }
}

const App = ({ initialPage, initialParams }) => {
  return h(Fragment, {}, [
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
