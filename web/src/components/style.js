// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { useMemo } from 'preact/hooks';

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
  return h('style', {}, styleSheet); 
};

export {
  Style
};
