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


export const useRefMap = /*:: <K, V>*/()/*: [(key: K) => (ref: null | V) => void, Map<K, V>]*/ => {
  const [map] = useState(new Map());
  const useKeyedRef = useMemo(() => (key) => (value) => {
    if (value === null)
      map.delete(key)
    else
      map.set(key, value)
  }, [])
  return [useKeyedRef, map];
}

/*::
export type RefMap2<K, V> = {
  create(key: K): { current: ?V },
  map: Map<K, { current: ?V }>,
}
*/

export const useRefMap2 = /*:: <K, V>*/()/*: RefMap2<K, V>*/ => {
  const [map] = useState(new Map());
  const create = (key) => {
    const ref = map.get(key) || { current: null };
    map.set(key, ref);
    return ref;
  };
  return { create, map }
}

/*::
type Sizes = {
  heights: number[],
  offsets: number[]
}
*/
const useItemsSizes = (items, itemRefMap)/*: Sizes*/ => {
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

const findItemIndexFromPosition = (
  currentIndex/*: number*/,
  position/*: number*/,
  { heights, offsets }/*: Sizes*/
) => {
  const zones = heights
    .map((height, itemIndex) => {
      const offset = offsets[itemIndex];
      switch (itemIndex) {
        case currentIndex + 1:
          return [offset + (height/2), offset + height];
        case currentIndex - 1:
          return [offset, offset + (height/2)];
        case currentIndex:
          return [
            offsets[itemIndex - 1] + (heights[itemIndex - 1]/2) || 0,
            offsets[itemIndex + 1] + (heights[itemIndex + 1]/2),
          ];
        default:
          return [offset, offset + height];
      }
    })
  const zoneIndex = zones.findIndex((zone, index) => {
    if (index === zones.length - 1)
      return position > zone[0];
    if (index === 0)
      return  position < zone[1];
    return position > zone[0] && position < zone[1];
  })
  const nextIndex = Math.max(0, Math.min(zones.length - 1, zoneIndex))
  return nextIndex;
}

/*::
export type OrderedListEditorProps = {
  EntryComponent: Component<{ id: string }>,
  itemsIds: $ReadOnlyArray<string>,
  onItemIdsChange: (id: string[]) => mixed,
};
*/
export const OrderedListEditor/*: Component<OrderedListEditorProps>*/ = ({
  itemsIds,
  onItemIdsChange,
  EntryComponent,
}) => {
  const [stagingOrder, setStagingOrder] = useState([...itemsIds]);
  useEffect(() => {
    setStagingOrder([...itemsIds]);
  }, [...itemsIds])

  const [useKeyedRef, itemRefMap] = useRefMap/*:: <string, HTMLLIElement>*/();
  const [itemsAnimation, filter] = useAnimatedList(stagingOrder, [])
  const sizes = useItemsSizes(stagingOrder, itemRefMap);
  useEffect(() => {
    filter(a => itemsIds.includes(a.value))
  }, [itemsIds])

  const maxHeight = sizes.offsets[sizes.offsets.length - 1];

  const onIndexInput = (id) => (nextIndex) => {
    const filteredIds = stagingOrder.filter(i => i !== id);
    const nextIds = [
      ...filteredIds.slice(0, nextIndex),
      id,
      ...filteredIds.slice(nextIndex)
    ];
    setStagingOrder(nextIds)
  }
  const onIndexChange = (id) => (nextIndex) => {
    const filteredIds = stagingOrder.filter(i => i !== id);
    const nextIds = [
      ...filteredIds.slice(0, nextIndex),
      id,
      ...filteredIds.slice(nextIndex)
    ];
    setStagingOrder(nextIds)
    onItemIdsChange(nextIds);
  }

  return [
    h('ol', {
      style: {
        position: 'relative',
        height: maxHeight + 'px',
        padding: 0,
        listStyleType: 'none'
      }
    }, itemsAnimation.map(itemAnim =>
      h(OrderedListEditorEntry, {
        itemAnim,
        itemsIds: stagingOrder,
        sizes,
        index: stagingOrder.indexOf(itemAnim.value),
        ref: useKeyedRef(itemAnim.value),
        key: itemAnim.value,
        onIndexInput: onIndexInput(itemAnim.value),
        onIndexChange: onIndexChange(itemAnim.value)
      }, h(EntryComponent, { id: itemAnim.value }))))
  ];
};

const useVerticalDrag = () => {
  const [selectionOffset, setSelectionOffset] = useState(0);
  const [selected, setSelected] = useState(false);

  const subscribeDragEvents = (
    container/*: HTMLElement*/,
    control/*: HTMLElement*/,
    dragEvents/*: {
      onDragStart?: number => mixed,
      onDragMove?: (number, number) => mixed,
      onDragEnd?: (number, number) => mixed,
    }*/
  ) => {
    const parent = container.parentElement;
    if (!parent)
      return () => {};

    const calculateTop = (clientY, selectionOffset) => {
      const parentRect = parent.getBoundingClientRect();
      return clientY - parentRect.top - selectionOffset;
    }

    const calculatePosition = (clientY, selectionOffset) => {
      const parentRect = parent.getBoundingClientRect();
      const top = clientY - parentRect.top - selectionOffset;
      return top + selectionOffset;
    }

    const onPointerDown = (e/*: PointerEvent*/) => {
      if (e.button !== 0)
        return;
      control.setPointerCapture(e.pointerId);
      const rect = container.getBoundingClientRect();
      const selectionOffset = e.clientY - rect.top;
      const initialPosition = calculatePosition(e.clientY, selectionOffset);
      setSelectionOffset(selectionOffset)
      setSelected(true);
      dragEvents.onDragStart && dragEvents.onDragStart(initialPosition,)
    }
    const onPointerMove = (e/*: PointerEvent*/) => {
      if (!selected)
        return;
      const top = calculateTop(e.clientY, selectionOffset)
      dragEvents.onDragMove && dragEvents.onDragMove(top, top + selectionOffset)
    }

    const onPointerUp = (e/*: PointerEvent*/) => {
      if (!selected)
        return;
      setSelected(false);
      const top = calculateTop(e.clientY, selectionOffset)
      dragEvents.onDragEnd && dragEvents.onDragEnd(top, top + selectionOffset)
      control.releasePointerCapture(e.pointerId);
    };

    const onLostPointerCapture = (e/*: PointerEvent*/) => {
      setSelected(selected => {
        if (selected)
          control.setPointerCapture(e.pointerId);
        return selected;
      })
    }
  
    control.addEventListener('pointerdown', onPointerDown);
    control.addEventListener('pointerup', onPointerUp);
    control.addEventListener('pointermove', onPointerMove);
    control.addEventListener('lostpointercapture', onLostPointerCapture);
    
    return () => {
      control.removeEventListener('pointerdown', onPointerDown);
      control.removeEventListener('pointerup', onPointerUp);
      control.removeEventListener('pointermove', onPointerMove);
      control.removeEventListener('lostpointercapture', onLostPointerCapture);
    }
  }

  return [selected, subscribeDragEvents];
}

const useAnimatedDraggableEntry = /*:: <TContainer: HTMLElement, TControl: HTMLElement>*/(
  sizes/*: Sizes*/,
  index/*: number*/,
  onIndexInput/*: number => mixed*/, onIndexChange/*: number => mixed*/,
  containerRef/*: Ref<?TContainer>*/, controlRef/*: Ref<?TControl>*/
) => {
  const offset = sizes.offsets[index];

  const [offsetAnim, setOffsetAnim] = useState/*:: <CubicBezierAnimation>*/(
    createInitialCubicBezierAnimation(offset)
  );

  const [prevOffset, setPrevOffset] = useState(offset);

  // If the offset changes, animate to the next offset
  useEffect(() => {
    if (prevOffset === undefined) {
      setPrevOffset(offset);
      return setOffsetAnim(
        createInitialCubicBezierAnimation(offset)
      );
    }
    
    setOffsetAnim(prev => {
      const now = performance.now();
      const next = interpolateCubicBezierAnimation(prev, offset, 300, 3, now);
      return next;
    })
  }, [offset])

  useBezierAnimation(offsetAnim, point => {
    const { current: li } = containerRef;
    if (!li || selected)
      return;
    li.style.transform = `translateY(${point.position}px)`;
  });

  const [selected, subscribe] = useVerticalDrag();
  useEffect(() => {
    const { current: li } = containerRef;
    const { current: button } = controlRef;
    if (!li || !button)
      return;

    const unsubscribe = subscribe(li, button, {
      onDragMove(position, pointerPosition) {
        li.style.transform = `translateY(${position}px)`;
        const nextIndex = findItemIndexFromPosition(index, pointerPosition, sizes);
        if (nextIndex !== index) {
          onIndexInput(nextIndex)
        }
      },
      onDragEnd(position, pointerPosition) {
        setOffsetAnim(interpolateCubicBezierAnimation(
          createInitialCubicBezierAnimation(position),
          offset, 300, 0, performance.now())
        );
        const nextIndex = findItemIndexFromPosition(index, pointerPosition, sizes);
        onIndexChange(nextIndex)
      }
    });
    return () => {
      unsubscribe()
    }
  }, [subscribe])

  return [selected];
}

const OrderedListEditorEntry = ({
  sizes,
  index,
  ref,
  onIndexInput,
  onIndexChange,
  children,
}) => {
  const internalRef = useRef/*:: <?HTMLLIElement>*/();
  const controlRef = useRef/*:: <?HTMLElement>*/();
  const [selected] = useAnimatedDraggableEntry(
    sizes,
    index, onIndexInput, onIndexChange,
    internalRef, controlRef
  );

  return h('li', {
    ref: value => (internalRef.current = value, ref(value)),
    value: index,
    style: {
      zIndex: selected ? 1 : 0,
      opacity: selected ? 0.8 : 1,
      border: '1px solid black',
      position: 'absolute',
    }
  }, h('div', {}, [
    children,
    ' ',
    h('button', {
      ref: controlRef,
      style: { cursor: 'ns-resize' }
    }, "Drag to Reorder")
  ]))
}