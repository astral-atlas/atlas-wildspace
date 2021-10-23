// @flow stricy
/*:: import type { Component } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';

export const Login/*: Component<{}>*/ = () => {
  return [
    h('h2', {}, `Login Required`),
    h('p', {}, `Wildspace requires you to be logged in`),
    h('p', {}, [`Visit `, h('a', { href: 'http://sesame.astral-atlas.com' }, 'Sesame'), ' to log in, and click the refresh button once you logged in.']),
    h('button', {}, 'Refresh login access')
  ]
};