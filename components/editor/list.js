// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type {  } from '@lukekaalim/act-curve'; */
/*::
import type {
  CubicBezier,
  CubicBezierAnimation,
} from "@lukekaalim/act-curve/bezier";
import type { Ref } from "@lukekaalim/act";
*/


import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { useAnimatedList } from "@lukekaalim/act-curve";
import {
  useAnimatedNumber,
  useBezierAnimation,
} from "@lukekaalim/act-curve";
import { useAnimation } from "@lukekaalim/act-curve/animation";
import {
  calculateCubicBezierAnimationPoint,
  createInitialCubicBezierAnimation,
  interpolateCubicBezierAnimation,
} from "@lukekaalim/act-curve/bezier";
import { maxSpan, useTimeSpan } from "@lukekaalim/act-curve/schedule";

/*::
export type OrderedListEditorProps = {
  itemsIds: string[],
  onIndexChange: (id: string) => (indexOffset: number) => mixed,
};
*/

const useRefMap = /*:: <K, V>*/()/*: [(key: K) => (ref: null | V) => void, Map<K, V>]*/ => {
  const [map] = useState(new Map());
  const useKeyedRef = useMemo(() => (key) => (value) => {
    if (value === null)
      map.delete(key)
    else
      map.set(key, value)
  }, [])
  return [useKeyedRef, map];
}
const useItemsSizes = (items, itemRefMap) => {
  const [sizes, setSizes] = useState({
    heights: [],
    offsets: []
  });

  const calculateSizes = () => {
    const heights = items
      .map(id => itemRefMap.get(id))
      .map(element => element ? element.getBoundingClientRect().height : 0);
    const offsets = heights
      .reduce((acc, curr, i) => [...acc, acc[i] + curr], [0])
    return { offsets, heights };
  }

  useEffect(() => {
    const onResize = () => {
      setSizes(calculateSizes());
    }
    const observer = new ResizeObserver(onResize);
    for (const [, element] of itemRefMap)
      observer.observe(element);
    return () => {
      observer.disconnect();
    }
  }, [items])

  return sizes;
}

export const OrderedListEditor/*: Component<OrderedListEditorProps>*/ = ({
  itemsIds,
  onIndexChange,
}) => {
  const [useKeyedRef, itemRefMap] = useRefMap/*:: <string, HTMLLIElement>*/();
  const [itemsAnimation] = useAnimatedList(itemsIds, [])
  const sizes = useItemsSizes(itemsIds, itemRefMap);
  
  const maxHeight = sizes.offsets[sizes.offsets.length - 1];

  return [
    h('ol', { style: { position: 'relative', height: maxHeight + 'px' } }, itemsAnimation.map(itemAnim =>
      h(OrderedListEditorEntry, {
        itemAnim,
        itemsIds,
        sizes,
        index: itemsIds.indexOf(itemAnim.value),
        ref: useKeyedRef(itemAnim.value),
        key: itemAnim.value,
        onIndexChange: onIndexChange(itemAnim.value)
      })))
  ];
};

const useVerticalDrag = (
  ref/*: Ref<?HTMLElement>*/,
  onDragStart/*:  number => mixed*/ = () => {},
  onDrag/*:       number => mixed*/ = () => {},
  onDragEnd/*:    number => mixed*/ = () => {}
) => {
  const [selectionOffset, setSelectionOffset] = useState(0);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const { current: element } = ref;
    if (!element)
      return;
    const parent = element.parentElement;
    if (!parent)
      return;

    const calculatePosition = (clientY, selectionOffset) => {
      const parentRect = parent.getBoundingClientRect();
      const top = clientY - parentRect.top - selectionOffset;
      return top + selectionOffset;
    }

    const onMouseDown = (e/*: PointerEvent*/) => {
      element.setPointerCapture(e.pointerId);
      const rect = element.getBoundingClientRect();
      const selectionOffset = e.clientY - rect.top;
      const initialPosition = calculatePosition(e.clientY, selectionOffset);
      setSelectionOffset(selectionOffset)
      setSelected(true);
      onDragStart(initialPosition)
    }
    const onMouseMove = (e/*: PointerEvent*/) => {
      if (!selected)
        return;
      const nextPosition = calculatePosition(e.clientY, selectionOffset)
      onDrag(nextPosition)
    }

    const onMouseUp = (e/*: PointerEvent*/) => {
      setSelected(false);
      const finalPosition = calculatePosition(e.clientY, selectionOffset)
      onDragEnd(finalPosition)
      element.releasePointerCapture(e.pointerId);
    };

    element.addEventListener('pointerdown', onMouseDown);
    element.addEventListener('pointermove', onMouseMove);
    element.addEventListener('pointerup', onMouseUp);
    return () => {
      element.removeEventListener('pointerdown', onMouseDown);
      element.removeEventListener('pointermove', onMouseMove);
      element.removeEventListener('pointerup', onMouseUp);
    }
  })

  return selected;
}

const OrderedListEditorEntry = ({
  itemAnim,
  sizes,
  index,
  ref,
  onIndexChange
}) => {
  const offset = sizes.offsets[index] || 0;
  const internalRef = useRef/*:: <?HTMLLIElement>*/();
  const [offsetAnim, setOffsetAnim] = useState/*:: <CubicBezierAnimation>*/(createInitialCubicBezierAnimation(offset));
  useEffect(() => {
    setOffsetAnim(prev => {
      const now = performance.now();
      const next = interpolateCubicBezierAnimation(prev, offset, 300, 3, now);
      return next;
    })
  }, [offset])

  // For pure size changes
  useEffect(() => {
    setOffsetAnim(createInitialCubicBezierAnimation(offset))
  }, [...sizes.heights.sort()]);

  useBezierAnimation(offsetAnim, point => {
    const { current: li } = internalRef;
    if (!li || selected)
      return;
    li.style.transform = `translateY(${point.position}px)`;
  });
  useBezierAnimation(itemAnim.index, point => {
    const { current: li } = internalRef;
    if (!li)
      return;
    li.value = Math.round(point.position);
  })



  const [selected, setSelected] = useState(false);
  const [selectionOffset, setSelectionOffset] = useState(0);
  const onMouseDown = (e) => {
    const { current: li } = internalRef;
    if (!li)
      return;
    setSelected(true);
    e.target.setPointerCapture(e.pointerId);
    const rect = li.getBoundingClientRect();
    const offset = e.clientY - rect.top
    setSelectionOffset(offset)
  }
  const onMouseMove = (e) => {
    const { current: li } = internalRef;
    const ol = li && li.parentElement;
    if (!li || !selected || !ol)
      return;
    const parentRect = ol.getBoundingClientRect();
    const position = e.clientY - parentRect.top - selectionOffset;
    const center = position + selectionOffset;
    const nextHeight = sizes.offsets[index + 1] + (sizes.heights[index + 1] / 2)
    const prevHeight = offset - (sizes.heights[index - 1] / 2)
    if (center < prevHeight) {
      onIndexChange(-1)
    }
    if (center > nextHeight) {
      onIndexChange(+1);
    }
    li.style.transform = `translateY(${position}px)`;
  }
  const onMouseUp = (e) => {
    const { current: li } = internalRef;
    const ol = li && li.parentElement;
    if (!li || !ol)
      return;
    setSelected(false);
    e.target.releasePointerCapture(e.pointerId);
    const parentRect = ol.getBoundingClientRect();
    const position = e.clientY - parentRect.top - selectionOffset;
    const now = performance.now();
    setOffsetAnim(interpolateCubicBezierAnimation(
      createInitialCubicBezierAnimation(position),
      offset,
      100, 3, now
    ))
  }
  const onLostPointerCapture = (e) => {
    if (selected)
      e.target.setPointerCapture(e.pointerId);
  }
  const [backgroundColor] = useState(`hsl(${Math.random() * 255}, 60%, 70%)`)

  return h('li', {
    ref: value => (internalRef.current = value, ref(value)),
    style: {
      zIndex: selected ? 1 : 0,
      opacity: selected ? 0.8 : 1,
      border: '1px solid black',
      position: 'absolute',
    }
  }, h('div', { style: { resize: 'both', overflow: 'hidden', padding: '16px', backgroundColor } }, [
    itemAnim.value,
    ' ',
    h('button', {
      onMouseDown, onMouseMove, onMouseUp, onLostPointerCapture,
      style: { cursor: 'ns-resize' }
    }, "Drag to Reorder")
  ]))
}