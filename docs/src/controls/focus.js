// @flow strict
/*:: import type { Ref } from '@lukekaalim/act'; */
import { useState, useEffect } from '@lukekaalim/act';

export const useFocus = /*:: <T: HTMLElement>*/(
  ref/*: Ref<?T>*/,
  deps/*: mixed[]*/ = []
)/*: boolean*/ => {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const { current: element } = ref;
    if (!element)
      return;
    
    const onFocus = () => {
      setFocused(true);
    };
    const onBlur = () => {
      setFocused(false);
    };
    element.addEventListener('focus', onFocus);
    element.addEventListener('blur', onBlur);
    return () => {
      element.removeEventListener('focus', onFocus);
      element.removeEventListener('blur', onBlur);
    }
  }, deps);
  
  return focused;
};