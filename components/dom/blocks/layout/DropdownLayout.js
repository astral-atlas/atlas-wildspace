// @flow strict
/*::
import type { Component, Ref, Context } from "@lukekaalim/act";
import type { ReadOnlyRef } from "../../../three/useChildObject";
*/
import { createContext, h, useContext, useEffect, useRef } from "@lukekaalim/act";
import styles from './DropdownLayout.module.css';

/*::
export type DropdownLayoutProps = {
  hidden?: boolean,
  position?: 'above' | 'below',
  
  onFocusIn?: FocusEvent => mixed,
  onFocusOut?: FocusEvent => mixed,
}
*/

export const DropdownLayout/*: Component<DropdownLayoutProps>*/ = ({
  children,
  hidden = false,
  position = 'below',
  onFocusIn,
  onFocusOut,
}) => {
  return h('div', { classList: [
    styles.dropdown,
    hidden && styles.hidden,
    styles[position]
  ], tabindex: -1, onFocusIn, onFocusOut },
    children)
};

export const DropdownRowLayout/*: Component<>*/ = ({ children }) => {
  return h('div', { class: styles.dropdownRow },
    children)
}

export const dropdownRootContext/*: Context<null | ReadOnlyRef<null | HTMLElement>>*/ = createContext(null);
/*::
export type DropdownRootPortalProps = {
  ref?: ReadOnlyRef<?HTMLElement>,
  parentRef: ReadOnlyRef<?HTMLElement>
}

*/
export const DropdownRootPortal/*: Component<DropdownRootPortalProps>*/ = ({
  children,
  parentRef,
  ref
}) => {
  const internalRef = useRef/*:: <?HTMLElement>*/(null);
  const finalRef = ref || internalRef;
  const rootRef = useContext(dropdownRootContext);

  useEffect(() => {
    if (!rootRef)
      return console.warn('Trying to create dropdown portal without a <DropdownRoot />');
    const { current: container } = finalRef;
    const { current: parent } = parentRef;
    const { current: root } = rootRef;
    if (!container || !root || !parent) return;

    const onParentResize = () => {
      const parentRect = parent.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      container.style.top =     (parentRect.top - rootRect.top) + 'px';
      container.style.height =  parentRect.height + 'px';
      container.style.left =    (parentRect.left - rootRect.left) + 'px';
      container.style.width =   parentRect.width + 'px';
    };
    const observer = new ResizeObserver(onParentResize);
    observer.observe(parent);
    
    root.appendChild(container);
    return () => {
      if (container.parentNode)
        container.parentNode.removeChild(container);
    }
  }, [parentRef, finalRef]);

  return h('act:null', {},
    h('div', { 
      ref,
      style: { position: 'absolute', zIndex: 100, pointerEvents: 'none' } 
    }, children))
};

export const DropdownRoot/*: Component<>*/ = ({ children }) => {
  const ref = useRef(null);

  return [
    h(dropdownRootContext.Provider, { value: ref }, children),
    h('div', { ref, ignoreChildren: true, class: styles.dropdownRoot })
  ];
};
