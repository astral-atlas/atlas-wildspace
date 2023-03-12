// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
*/

import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import styles from './GameWindowOverlayLayout.module.css';

/*::
export type GameWindowOverlayLayoutProps = {
  topLeft?: ElementNode
}
*/

export const GameWindowOverlayLayout/*: Component<GameWindowOverlayLayoutProps>*/ = ({
  topLeft,
  children,
}) => {
  return h('div', { class: styles.overlay }, [
    children
  ]);
}

/*::
export type GameWindowOverlayAnchorProps = {
  va: 'top' | 'bottom',
  ha: 'left' | 'right'
}
*/

export const GameWindowOverlayAnchor/*: Component<GameWindowOverlayAnchorProps>*/ = ({
  children,
  va, ha,
}) => {
  return h('div', { classList: [
    styles.anchor,
    styles[va],
    styles[ha]
  ] }, [
    children,
  ]);
}

/*::
export type GameWindowOverlayExpandingIconProps = {
  iconSrc: string,
};
*/

export const GameWindowOverlayExpandingIcon/*: Component<GameWindowOverlayExpandingIconProps>*/ = ({
  children,
  iconSrc,
}) => {
  const iconRef = useRef/*:: <?HTMLElement>*/();
  const containerRef = useRef/*:: <?HTMLElement>*/();
  const windowRef = useRef/*:: <?HTMLElement>*/();

  const [iconRect, setIconRect] = useState(null)
  const [containerRect, setContainerRect] = useState(null)

  const [hover, setHover] = useState(false);

  useEffect(() => {
    const { current: icon } = iconRef;
    const { current: container } = containerRef;
    if (!icon || !container)
      return null;

    const onIconResize = () => {
      setIconRect(icon.getBoundingClientRect());
    }
    const onContainerResize = () => {
      setContainerRect(container.getBoundingClientRect());
    }

    const iconObserver = new ResizeObserver(onIconResize);
    const containerObserver = new ResizeObserver(onContainerResize);
    iconObserver.observe(icon);
    containerObserver.observe(container);
    return () => {
      iconObserver.disconnect();
      containerObserver.disconnect();
    }
  }, []);
  const style = {
    width: hover
      ? (containerRect ? `${containerRect.width}px` : '0px')
      : (iconRect ? `${iconRect.width}px` : '0px'),
    height: hover
      ? (containerRect ? `${containerRect.height}px` : '0px')
      : (iconRect ? `${iconRect.height}px` : '0px'),
  }
  const onPointerEnter = () => {
    setHover(true);
  };
  const onPointerLeave = () => {
    setHover(false);
  }

  return h('div', { ref: windowRef, class: styles.iconWindow, style, onPointerEnter, onPointerLeave }, [
    h('div', { ref: containerRef, class: styles.iconContainer }, [
      h('img', { ref: iconRef, class: styles.iconImage, src: iconSrc }),
      h('div', { style: { display: 'flex', overflowY: 'auto', flex: 1 } }, [
        children,
      ]),
    ])
  ]);
};

/*::
export type GameWindowOverlayButtonProps = {
  iconSrc: string,
  onClick?: () => mixed,
};
*/

export const GameWindowOverlayButton/*: Component<GameWindowOverlayButtonProps>*/ = ({
  iconSrc,
  onClick,
}) => {
  return h('button', { class: styles.overlayButton, onClick },
    h('img', { src: iconSrc, class: styles.overlayButtonImage }))
};

export const GameWindowOverlayBox/*: Component<>*/ = ({
  children
}) => {
  return h('div', { class: styles.overlayBox },
    children)
}