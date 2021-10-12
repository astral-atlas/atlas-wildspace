// @flow strict
/*:: import type { WWWConfig } from "@astral-atlas/wildspace-models"; */
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useMemo, useState, useEffect } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-three';
import { useConsumerMessenger } from '@astral-atlas/sesame-components';
import { createWildspaceClient } from '@astral-atlas/wildspace-client2';

import { loadConfigFromURL } from './config.js';

import { identityContext } from './hooks/identity.js';
import { apiContext } from './hooks/api.js';
import { useAsync } from "./hooks/async.js";
import { useStoredValue } from './hooks/storage.js';
import { navigationContext } from "./hooks/navigation.js";

import { identityStore } from "./lib/storage.js";

/*::
export type WildspaceAppProps = {
  config: WWWConfig,
  initialURL: URL,
};
*/

export const WildspaceApp/*: Component<WildspaceAppProps>*/ = ({ config, children, initialURL }) => {
  const [identity, setIdentity] = useStoredValue(identityStore);
  const [url, setURL] = useState(initialURL)

  const onGrant = ({ proof }) => {
    setIdentity(v => ({ proof }));
  };
  const onReject = (e) => {
    setIdentity(v => null);
    console.warn(e)
  }

  const messenger = useConsumerMessenger('http://sesame.astral-atlas.com', {
    proof: identity && identity.proof,
    onGrant,
    onReject
  });
  
  const api = useMemo(
    () =>  createWildspaceClient(identity && identity.proof, config.api.wildspace.httpOrigin, config.api.wildspace.wsOrigin),
    [identity && identity.proof]
  );

  const navigation = useMemo(() => ({
    url,
    navigate(newURL) {
      history.pushState(null, '', newURL.href);
      setURL(new URL(newURL.href))
    }
  }), [url.href]);
  useEffect(() => {
    window.addEventListener('popstate', () => {
      setURL(new URL(document.location.href));
    });
  }, [])
  const identityContextValue = useMemo(() => ({ identity, messenger, setIdentity }), [identity, messenger, setIdentity]);

  return (
    h(identityContext.Provider, { value: identityContextValue },
      h(apiContext.Provider, { value: api },
        h(navigationContext.Provider, { value: navigation }, children)))
  );
};

export const renderAppPage = async (PageComponent/*: Component<{ config: WWWConfig }>*/) => {
  const { body } = document;
  if (!body)
    throw new Error();
  
  const config = await loadConfigFromURL();
  const initialURL = new URL(document.location.href);

  render(h(WildspaceApp, { config, initialURL }, h(PageComponent, { config })), body);
};