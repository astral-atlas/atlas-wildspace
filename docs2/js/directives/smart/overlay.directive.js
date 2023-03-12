// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { FramePresenter } from "../presentation/FramePresenter";
import { h, useState } from "@lukekaalim/act"
import {
  GameWindowOverlayAnchor,
  GameWindowOverlayBox,
  GameWindowOverlayButton,
  GameWindowOverlayExpandingIcon,
  GameWindowOverlayLayout
} from "@astral-atlas/wildspace-components";
import iconSrc from './assets/smile.png';
import { FillBlock } from "../presentation/blocks";

export const GameWindowOverlayLayoutDemo/*: Component<>*/ = () => {
  return [
    h(FramePresenter, {}, [
      h(FillBlock, { backgroundImage: `url(https://cataas.com/cat)` }),
      h(GameWindowOverlayLayout, {}, [
        h(GameWindowOverlayAnchor, { va: 'bottom', ha: 'right' }, [
          h(GameWindowOverlayExpandingIcon, { iconSrc }, [
            'Some cool content availabel on hover'
          ]),
          h(GameWindowOverlayExpandingIcon, { iconSrc }, [
            'Some more content availabel on hover'
          ]),
          h(GameWindowOverlayButton, { iconSrc, onClick: () => alert('Boo!') })
        ]),
        h(GameWindowOverlayAnchor, { va: 'top', ha: 'left' }, [
          h(GameWindowOverlayExpandingIcon, { iconSrc }, [
            'Sample Content'
          ]),
          h(GameWindowOverlayBox, {}, [
            h('h4', { style: { margin: '2px' } }, 'Magnus of Lords'),
            h('p', { style: { margin: '2px' } }, `Our tale begins in the dim past of the 56th century`)
          ])
        ]),
        h(GameWindowOverlayAnchor, { va: 'top', ha: 'right' }, [
          h(GameWindowOverlayExpandingIcon, { iconSrc }, [
            h('ol', {}, [h('li', {}, 'Element A'), h('li', {}, 'Element B')])
          ])
        ]),
      ]),
    ])
  ];
}