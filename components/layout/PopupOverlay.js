// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
*/

import { h, useRef } from "@lukekaalim/act";
import { useAnimatedNumber, useBezierAnimation } from "@lukekaalim/act-curve";

import classes from './PopupOverlay.module.css';
import { useAnimatedKeyedList } from "../animation/list";

/*::
export type PopupOverlayProps = {
  onBackgroundClick?: () => mixed,
  popupRef?: Ref<?HTMLElement>,
  visible: boolean,
}
*/

export const PopupOverlay/*: Component<PopupOverlayProps>*/ = ({
  onBackgroundClick = () => {},
  visible = false,
  popupRef = null,
  children
}) => {
  const backgroundRef = useRef();
  const onClick = (e) => {
    if (e.target !== e.currentTarget)
      return;
    onBackgroundClick();
  }

  const [anim] = useAnimatedNumber(visible ? 1 : 0, visible ? 1 : 0, { duration: 500, impulse: 3 });
  useBezierAnimation(anim, (point) => {
    const { current: background } = backgroundRef;
    if (!background)
      return;
    background.style.opacity = `${point.position}`;

    if (popupRef) {
      const { current: popup } = popupRef;
      if (popup)
      popup.style.transform = `
        translate3d(0%, ${(1 - point.position) * 8}rem, ${(1 - point.position) * -30}rem)
        rotate3d(1, 0, 0, ${(1 - point.position) * 20}deg)
      `;
    }
  });
  
  return [
    h('div', {
      onClick,
      class: classes.background,
      ref: backgroundRef,
      style: { pointerEvents: visible ? 'auto' : 'none' } },
      children),
  ];
}