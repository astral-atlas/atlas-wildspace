// @flow strict
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { render } from '@lukekaalim/act-web';

import { AuthorizerFrame } from '@astral-atlas/sesame-components';
import { createWildspaceClient } from '@astral-atlas/wildspace-client2';

import styles from './index.module.css';
import { GamesEditor } from './gameEditors.js';
import { clientContext } from './hooks.js';
import { loadConfig } from "../config.js";
import { useIdentity } from "../hooks/identity.js";
import { IdentityProvider } from "../hooks/identity";

import { renderAppPage } from '../app.js';

const AdminPage = ({ config }) => {
  const [identity] = useIdentity();
  const [u, setU] = useState(Date.now());

  if (!identity)
    return h('h1', {}, `You need to log in!`);

  const client = createWildspaceClient(identity && identity.proof, config.api.wildspace.httpOrigin, config.api.wildspace.wsOrigin);

  return [
    h(clientContext.Provider, { value: client }, [
      h('h1', {},'Wildspace Admin'),
      h(GamesEditor, { u, setU }),
    ]),
  ]
};

renderAppPage(AdminPage);