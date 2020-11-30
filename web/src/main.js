import "preact/debug";

import { render, h } from 'preact';
import { App } from './app';

const main = () => {
  const url = new URL(window.location.href);
  const initialPage = url.pathname;
  const initialParams = Object.fromEntries(url.searchParams);
  
  render(h(App, { initialPage, initialParams }), document.body);
};

main();