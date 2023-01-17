// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { TerrainEditorData } from "../useTerrainEditorData";
import type { ReadOnlyRef } from "../../three/useChildObject";

*/

import { h, useEffect, useRef } from "@lukekaalim/act";
import styles from './Toolbar.module.css';
import { useState } from "@lukekaalim/act";
import { calculateCubicBezierAnimationPoint, useAnimatedNumber } from "@lukekaalim/act-curve/bezier";
import { useTimeSpan } from "@lukekaalim/act-curve";
import { useAnimatedVector2 } from "../../animation/2d";
import whiteFilmIconURL from './white_film.png';
import { icons } from "../../assets";

/*::
export type ToolbarProps = {
  editor: TerrainEditorData,
  cameraSurfaceRef: Ref<?HTMLElement>
}
*/

export const Toolbar/*: Component<ToolbarProps>*/ = ({ editor, cameraSurfaceRef }) => {

  return h('div', { class: styles.toolbar }, [
    h(TransformTool, { editor }),
    h(ToolButton, { ref: cameraSurfaceRef, iconURL: whiteFilmIconURL }),
  ]);
};

const TransformTool = ({ editor }) => {
  const tool = editor.state.selectedTransformTool;
  const toolIcons = {
    'rotate': icons.cube.rotate,
    'translate': icons.cube.translate,
    'none': null,
    'scale': null,
  };

  const currentIconURL = toolIcons[tool] || icons.cube.translate;

  const onClick = () => {
    const nextTool = tool === 'rotate' ? 'translate' : 'rotate';
    editor.dispatch({ type: 'switch-tool', tool: nextTool });
  };

  return h(ToolButton, { iconURL: currentIconURL, onClick });
}

/*::
export type ToolButtonProps = {
  ref?: Ref<?HTMLElement>,
  iconURL: string,
  onClick?: MouseEvent => mixed,
}
*/

const ToolButton/*: Component<ToolButtonProps>*/ = ({ ref, iconURL, onClick }) => {
  return h('button', { class: styles.toolButton, ref, onClick }, [
    h('img', { src: iconURL, style: { width: `32px`, height: `32px`, objectFit: 'contain' } }),
  ])
}

const ToolForm = () => {
  const [hover, setHover] = useState(false)
  const smallContentRef = useRef/*:: <?HTMLElement>*/();
  const bigContentRef = useRef/*:: <?HTMLElement>*/();

  const smallRect = useBoundingRect(smallContentRef);
  const bigRect = useBoundingRect(bigContentRef);

  const targetRect = hover ? bigRect : smallRect;

  return h('div', {
    class: styles.tool,
    style: { width: (targetRect?.width || 0) + 'px', height: (targetRect?.height || 0) + 'px' },
    onPointerEnter: () => setHover(true),
    onPointerLeave: () => setHover(false)
  }, [
    h('span', { ref: bigContentRef, style: { whiteSpace: 'nowrap' } }, [
      h('img', { ref: smallContentRef, src: whiteFilmIconURL, style: { width: `32px`, height: `32px`, objectFit: 'contain' } }),
      ' ',
      h('span', {}, 'TRUE CONTENT IS HERER')
    ])
  ])
};

const useBoundingRect = (ref/*: ReadOnlyRef<?HTMLElement>*/)/*: ?ClientRect*/ => {
  const [rect, setRect] = useState(null)
  useEffect(() => {
    const { current: element } = ref;
    if (!element)
      return;
    const updateRect = () => {
      setRect(element.getBoundingClientRect());
    };
    updateRect();

    const observer = new ResizeObserver(updateRect);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return rect;
}