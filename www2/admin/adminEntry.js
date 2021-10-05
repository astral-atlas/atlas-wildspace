// @flow strict
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { render } from '@lukekaalim/act-web';

import { AuthorizerFrame } from '@astral-atlas/sesame-components';
import { createWildspaceClient } from '@astral-atlas/wildspace-client2';

import styles from './index.module.css';
import { GamesEditor } from './gameEditors.js';

const AdminPage = () => {
  const [u, setU] = useState(Date.now());

  return [
    h('h1', {},'Wildspace Admin'),
    h(GamesEditor, { u, setU }),
  ]
};

const main = () => {
  const { body } = document;
  if (!body)
    throw new Error();
  render(h(AdminPage), body);
};

main();