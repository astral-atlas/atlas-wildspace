// @flow strict

/*::
import type { Component } from '@lukekaalim/act';
*/
import { DropdownRoot } from '@astral-atlas/wildspace-components';
import { h, useState } from '@lukekaalim/act';
import { nanoid } from 'nanoid/non-secure';
import styles from './FramePresenter.module.css';

/*::
export type FramePresenterProps = {
  height?: string,
  padding?: string,
};
*/

export const FramePresenter/*: Component<FramePresenterProps>*/ = ({
  children,
  //style,
  height = '512px',
  padding = '0px'
}) => {
  return [
    h('div', { class: styles.framePresenterContainer, style: { height } }, [
      h('div', { class: styles.framePresenterContent, style: {
        position: 'relative',
        width: '100%', height: '100%',
        maxWidth: '100%', maxHeight: '100%',
        boxSizing: 'border-box',
        resize: 'both', overflow: 'hidden',
        padding
      } }, h(DropdownRoot, {}, children)),
    ]),
  ]
}

/*::
export type ScalableFramePresenterProps = {

};
*/

export const ScalableFramePresenter/*: Component<ScalableFramePresenterProps>*/ = ({ children, style, height }) => {
  const [scale, setScale] = useState(1);
  const ref = useRef();
  const onSetFullscreen = () => {
    const { current: element } = ref;
    if (element instanceof HTMLElement)
      element.requestFullscreen();
  }
  return [
    h(LayoutDemo, { style, height }, [
      h('div', { ref, style: {
        ...style,
        backgroundColor: 'white',
        transformOrigin: '0 0',
        transform: `scale(${scale})`,
        width: `${100/scale}%`,
        height: `${100/scale}%`,
      } }, children)
    ]),
    h('div', { style: { backgroundColor: '#e8e8e8' } }, [
      h(EditorForm, {}, [
        h(EditorHorizontalSection, {}, [
          h(EditorButton, { label: 'Fullscreen', onButtonClick: onSetFullscreen }),
          h(EditorRangeInput, {
            label: 'Scale', min: 0.1,
            step: 0.001,
            max: 1, number: scale,
            onNumberInput: scale => setScale(scale) })
        ]),
      ])
    ])
  ]
}