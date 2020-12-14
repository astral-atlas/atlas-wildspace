// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import { renderStyleSheet } from '../lib/style';


import { pageStyles } from './page';
import { footerStyles } from './footer';
import { tableAdminStyle } from './table';

import { style as characterCardStyle } from './cards/character';

import { style as headerGameStyle } from './header/game';
import { style as headerLoginStyle } from './header/login';
import { style as headerStyle } from './header';

import { style as homeStyle } from '../pages/home';

const Style = ()/*: Node*/ => {
  const styleSheet = useMemo(() => {
    return [
      homeStyle,
      characterCardStyle,
      headerGameStyle,
      headerLoginStyle,
      headerStyle,
    ].join('\n');
  }, []);
  const sheets = useMemo(() => {
    return [
      pageStyles,
      footerStyles,
      tableAdminStyle,
    ].map(renderStyleSheet)
  }, []);
  return [
    h('style', {}, styleSheet),
    ...sheets.map(sheet => h('style', {}, sheet)),
  ];
};

export {
  Style
};
