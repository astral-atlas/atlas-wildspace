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

import { renderDocument, WildspaceApp } from '../app.js';

const AdminPage = () => {
  const [u, setU] = useState(Date.now());

  return [
    h('h1', {},'Wildspace Admin'),
    h(GamesEditor, { u, setU }),
  ]
};

renderDocument(h(WildspaceApp, { initialURL: new URL(document.location.href) }, h(AdminPage)));