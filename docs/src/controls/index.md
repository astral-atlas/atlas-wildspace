# Controls

## KeyboardEvents

The most straightforward way to capture user direction
is to simply listen to
[keyboard events](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
using props - such as
[`onKeyDown`](https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event)
and
[`onKeyUp`](https://developer.mozilla.org/en-US/docs/Web/API/Document/keyup_event).

This pattern works best for step-like events that can be captured in component state.
Animation must be used to interpolate between values to move smoothly.

> There is a third event:
> [`onKeyPress`](https://developer.mozilla.org/en-US/docs/Web/API/Document/keypress_event)
> but it's __deprecated__, so we won't worry about it.

### Bubbling

As keyboard events are part of the DOM API, they __bubble__ up events, which means
"higher" elements in the DOM tree will get the event first, desceding to each "parent"
element that will get the event one by one until it to the root. Any component
in this journey can recieve the event and act upon it.

Attaching listeners to the document will get all key presses, but better yet is
attaching event listeners to a specific element.

### KeyDown Repeats
Keydown is sent multiple times for held keys, so you can't reliably use it
for one-shot events automatically. Keys that are
held fire one `keydown` instantly, then if they are held a bit longer they fire
many `keydown` events continually. "Repeat" keydown events have a `.repeat` property which
is true while they repeat but false for the initial press.

### Focus

Elements will recieve keyboard events when they are `focused`, and normally
non-focusable element (such as a canvas) can be made focusable
by setting a property called
[`tabIndex`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex).

> For complicated reasons, you almost always want a tabIndex value of zero (`0`).

### Demo

```ts
const cameraRef = useRef();

const controls = {
  'w': ([x, y]) => [x, y + 10],
  'a': ([x, y]) => [x - 10, y],
  's': ([x, y]) => [x, y - 10],
  'd': ([x, y]) => [x + 10, y],
}

const [focus, setFocus] = useState([0, 0]);
const onKeyDown = (event) => {
  const control = controls[event.key];
  if (control && !event.repeat) {
    setFocus(control)
    event.preventDefault();
  }
};

const anim = useAnimatedVector2(focus, [0, 0], 30, 600);

useTimeSpan(anim.max, now => {
  const { current: camera } = cameraRef;
  if (!camera)
    return;
  const { position: focus } = calculateBezier2DPoint(anim, now);
  camera.position.set(-focus[0], 40, focus[1] - 40);
  camera.lookAt(new Vector3(-focus[0], 0, focus[1]));
}, [anim]);

// ... 3D rendering hooks

return [
  h('canvas', { onKeyDown, tabIndex: 0 }),
  h(scene, { ref: sceneRef }, [
    h(perspectiveCamera, { ref: cameraRef }),
  ])
];
```
> Use WASD or Arrow keys while focusing the canvas to move the camera in increments.
>
::demo{name=events}

## KeyboardContext

Of course, your component tree might not correspond to the DOM Tree. You might
want child components that don't have access to a Canvas element to also recieve
key events - maybe these child elements don't even have a
DOM element associated with them (like an `act-three` object).

You might also want to choose to send some events to children, or handle them at
a higher level - such as checking if a modifier like `shift` is pressed, and performing
an alternative action.

:::api{name=keyboardContext}

```ts
import {
  keyboardContext,
  useKeyboardEvents,
  useKeyboardContextValue
} from '@astral-atlas/wildspace-components';
```

The types are a little heavy as there are a couple
of different related functions. The gist is:
  - __useKeyboardContextValue__ is used to attach some event handlers
  to the specific element using a `ref`. The return value is
  use to feed the context provider.
  - __keyboardContext__ is the context. Insert the provider into the tree
  to allow children to listen to keydown events.
  - __useKeyboardEvents__ is the useful bit. Use it to
  listen to `down` or `up` events. If another consumer of the context calls
  `preventDefault()`, then subsequent events won't recieve the event.


__keyboardContext__ can also be used act as _"middleware"_, you can choose to delegate
to children or consume the event at a higher level.
```ts
import type { Context, HTMLElement } from '@lukekaalim/act';

export type Subscriber<TEvent> = (event: TEvent) => mixed;
export type SubscriptionFunction<TEvent> = (
  (subscriber: Subscriber<TEvent>) => () => void
);

type KeyboardContextValue = {
  subscribeDown: SubscriptionFunction<KeyboardEvent>
  subscribeUp: SubscriptionFunction<KeyboardEvent>
}
type KeyboardEvents = {
  up?: Subscriber<KeyboardEvent>,
  down?: Subscriber<KeyboardEvent>
}

declare export var keyboardContext: Context<KeyboardContextValue>;
declare export function useKeyboardEvents(
  events: KeyboardEvents,
  deps?: mixed[]
): void;
declare export function useKeyboardContextValue(
  ref: Ref<?HTMLElement>
): KeyboardContextValue;
```

```ts
const Parent = () => {
  const ref = useRef();
  const contextValue = useKeyboardContextValue(ref);

  return [
    h('div', { ref }),
    h(keyboardContext.Provider, { value: contextValue },
      h(Child))
  ];
}

const Child = () => {
  useKeyboardEvents({
    down: console.log,
    up: console.log,
  });

  return null;
}
```
:::

### Demo

> Hold shift and WASD/Arrow Keys to move the cube.
> Pressing those keys without shift moves the camera.
>
> Also as the point of this demo is to show spread-apart
> state still reading the same key data I can't
> put the little value readout at the bottom.

::demo{name=context}

## KeyboardState

To achieve smooth motion, we need to track _when_ a key is pressed and
_when_ it is released, so we describe presses less like single events and more
like continous spans of time.

We can do this simply by keeping state of when a key is pressed or released, and
polling at a regular interval to read the state and apply the change then.

This is sufficient for most purposes as polling normally occurs during the 
"render loop" at 60 times per second. There is a space where if a button is pressed
and released in between frames, this is missed, but you would have to be very fast to do that.

::demo{name=state}

## KeyboardTrack

To ensure you capture everything, finally we can model keypresses as
a buffer of key inputs in a space of time, and each "frame" we can "consume"
or "read" the latest set of key presses since we last checked, and operate on that.

This ensures as long as a keypress is detected, it is interted into the buffer
(called a _track_) of keypresses, which is then read at the start of each frame.

::demo{name=track}