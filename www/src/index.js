// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { WWWConfig } from "@astral-atlas/wildspace-models"; */
import { useRootNavigation, navigationContext } from '@lukekaalim/act-navigation';
import { Boundary, h } from "@lukekaalim/act";
import './index.module.css';

import { HomePage } from "./home";
import { RoomPage } from './room';
import { IdentityProvider } from '../hooks/identity';
import { useNavigation } from "../hooks/navigation";


export const Wildspace/*: Component<{ config: WWWConfig }>*/ = ({ config }) => {
  const nav = useNavigation();

  switch (nav.url.pathname) {
    case '/':
      return h(HomePage)
    default:
      return h(RoomPage)
  }
};