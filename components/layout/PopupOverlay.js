// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { h, useRef } from "@lukekaalim/act";
import { useAnimatedNumber, useBezierAnimation } from "@lukekaalim/act-curve";

import classes from './PopupOverlay.module.css';
import { useAnimatedKeyedList } from "../animation/list";

/*::
export type PopupOverlayProps = {
  onBackgroundClick?: () => mixed,
  visible: boolean,
}
*/

export const PopupOverlay/*: Component<PopupOverlayProps>*/ = ({
  onBackgroundClick = () => {},
  visible = false,
  children
}) => {
  const backgroundRef = useRef();
  const popupRef = useRef();
  const onClick = (e) => {
    if (e.target !== e.currentTarget)
      return;
    onBackgroundClick();
  }

  const [anim] = useAnimatedNumber(visible ? 1 : 0, visible ? 1 : 0, { duration: 1000, impulse: 3 });
  useBezierAnimation(anim, (point) => {
    const { current: background } = backgroundRef;
    const { current: popup } = popupRef;
    if (!background || !popup)
      return;
      popup.style.transform = `translate(0%, ${(1 - point.position) * 8}rem)`;
    background.style.opacity = `${point.position * 2}`;
  });
  
  return [
    h('div', { onClick, class: classes.background, ref: backgroundRef, style: { pointerEvents: visible ? 'auto' : 'none' } },
      h('div', { class: classes.popup, ref: popupRef },
        children)),
  ];
}