import { createContext, h } from 'preact';
import { useState, useContext, useEffect } from 'preact/hooks';

const PageContext = createContext(['/', () => {}]);

const PageContextProvider = ({ initialPage, initialParams, children}) => {
  const [page, setPage] = useState(initialPage);
  const [params, setParams] = useState(initialParams);

  const onPopState = () => {
    const url = new URL(window.location.href);
    setPage(url.pathname);
    setParams(Object.fromEntries(url.searchParams) || {});
  }

  useEffect(() => {
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    }
  }, []);

  const navigate = (newPath, query = {}) => {
    const params = new URLSearchParams(query);
    const url = new URL(window.location.href);
    url.pathname = newPath;
    url.search = params;
    history.pushState(null, '', url.href);
    setPage(newPath);
    setParams(query);
  };

  return h(PageContext.Provider, { value: [page, params, navigate] }, children);
};

const usePageContext = () => {
  return useContext(PageContext)
};

export {
  PageContext,
  PageContextProvider,
  usePageContext,
}