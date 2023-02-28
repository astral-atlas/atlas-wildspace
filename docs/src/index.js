// @flow strict

import { h } from "@lukekaalim/act";
import { render } from "@lukekaalim/act-three";
import { RehersalApp } from '@lukekaalim/act-rehersal/rehersal2';
import styles from './index.module.css';
import { homePage } from "./pages/home";

const pages = [
  homePage
]

const Docs = () => {
  return h('div', { class: styles.docs },
    h(RehersalApp, { pages }))
}

const main = () => {
  const { body } = document;
  body && render(h(Docs), body)
};

main()