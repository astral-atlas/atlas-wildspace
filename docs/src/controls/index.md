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

A __context__ object and a set of hooks to assign and consume it.

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
  to allow children to listen to keydown events of a particular element.
  - __useKeyboardEvents__ is the useful bit. Use it to
  listen to `down` or `up` events. If another consumer of the context calls
  `preventDefault()`, then subsequent events won't recieve the event.


__keyboardContext__ can also be used act as _"middleware"_: you can choose to delegate
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

:::api{name=useKeyboardState}

```ts
declare function useKeyboardState(
  allowedKeys?: Set<string>,
  onKeysChange?: (keys: Set<string>) => mixed,
): [
  Ref<Set<string>>,
  { up: KeyboardEvent => void, down: KeyboardEvent => void }
];
```

:::

### Momentum

Without a fixed start and end time for the animation, you will need to decide the rules
of your movement simulation. Simply "adding" to the position is a valid way to move
and object, but also consider things like velocity and acceleration.

Once you add velocity, you probably also want to clamp it to ensure your
controls don't go out of bounds. You probably also want to "decay" or "drag" your
velocity over time.

:::api{name=simulateParticle2D}
```ts
import { simulateParticle2D } from '@astral-atlas/wildspace-components';
```
There is a small API to provide a basic momentum simulation for a single particle
with some special rules, like drag and velocity caps.

```ts
type Particle2D = {
  position: [number, number],
  velocityPerMs: [number, number],
}
type ParticleOptions = {
  dragCoefficent?: number, // how much velocity remains after 1 second?
  velocityMagnitudeMax?: number,
}

declare function simulateParticle2D(
  particle: Particle2D,
  options: ParticleOptions,
  acceleration: [number, number],
  durationMs: number,
): Particle2D
```

To use effectivley, simply call "simulate" for every duration of
constant velocity every frame, passing the return value (the particle "state")
back into the function the next call.

```ts
const particleRef = useRef({ position: [0,0], velocityPerMs: [0,0] })
useAnimation((now, delta) => {
  const acceleration = readInputToAcceleration();
  particleRef.current = simulateParticle2D(
    particleRef.current,
    {},
    acceleration,
    delta
  );
  console.log(particleRef.current);
})
```
:::

### Weaknesses

There are a couple weaknesses with KeyboardState. Reading
the inputs at a fixed interval means that if evens occur
_in between_ checks (like a user lowering and raising a
key quickly) then you won't observe the change at all.

Fast, quick inputs will be "ignored" sometimes by chance,
and this chance increases the longer the delay between reading
inputs, such as having a lower frame rate.

This also means the minimum "duration" you can consider
a key being held for is the same as the space between frames:
your code can't consider a key held for a shorter period.

### Demo
> #### Interval
> The state is checked and the animation is updated in lockstep -
> see how increasing the inverval (which lowers the "framerate")
> affects your inputs. You should notice some inputs missing if you
> press and release them between frames!
> ::interval

> For the sake of the Demo, the "keys" will be reported "truthfully"
> but the camera will only update if it detects the keypress change
> during render.


::demo{name=state}

## KeyboardTrack

To remedy the issues caused by checking the currently pressed
keys at the start of every frame, instead, we can keep a record
of all keypresses.

We can model keypresses as a buffer of key inputs in
a span of time, and each "frame" we can "consume"
or "read" the latest set of key presses since we
last checked, and operate on that.

This ensures as long as a keypress is detected, it is interted into the buffer
(called a _track_) of keypresses, which is then read at the start of each frame.

> "Read"ing the track also _clears_ the track - assuming each frame the track is
> read, we don't want previous input events (consumed in different frames)
> affecting the current state.

Generally, this is overkill unless you need really precise inputs, or are
paranoid about "losing" pressed (or if you framerate is pretty bad).

Or maybe you need an input buffer for some other reason?

### Iterating The Track

Logic implemented using KeyboardState can just be re-used for track,
treating each "input" frame as a whole render frame, accumulating the
output until we reach the end, and then applying the final state to
the mutable value.

If that was unreadable jargon, try:
  1. Reading the track at the start of each frame.
  2. Turning the "track" into a loop (like using `for (const frame of track) { ... }`).
  3. Store the _previous_ frame somewhere. (like outside the loop, `let prevFrame = { ... }`)
  4. Doing whatever calculations you needed with the keys as if the frame is
  `frame.time - prevFrame.time` long and has `prevFrame.value` keys pressed
  5. Finally, using whatever final value you got from the loop to the actual thing
  you want to update.

:::api{name=useKeyboardTrack}
```ts
declare function useKeyboardTrack(): [
  () => Frame<Set<string>>[],
  (keys: Set<string>) => mixed
]
```

The return value of useKeyboardTrack can be fed to "useKeyboardState"
to listen to keyboard events, or you can implement it yourself
if you have something weird going on.

```ts
const [read, onKeyChange] = useKeyboardTrack()
const [, keyboardEvents] = useKeyboardState(null, onKeyChange);
useKeyboardContext(keyboardEvents);

useAnimation((now, delta) => {
  const track = trackEvents.read();

  for (const { time, value } of track) {
    // do something accumulative with
    // all these "value"'s that you
    // get
    console.log(value);
  }
})
```
:::


### Demo

```ts
const [read, onKeyChange] = useKeyboardTrack()
const [, events] = useKeyboardState(null, onKeyChange);
const momentumRef = useRef({ position: [0, 0], velocityPerMs: [0, 0] });

useEffect(() => {
  const { current: camera } = cameraRef;
  if (!camera)
    return;

  let prevFrame = { time: 0, value: new Set() };
  const id = setInterval(() => {
    const tracks = read()
    const time = performance.now();
    const finalFrame = { ...(tracks[tracks.length - 1] || prevFrame), time };
  
    for (const frame of [...tracks, finalFrame]) {
      const delta = frame.time - prevFrame.time;
      const acceleration = getVectorForKeys([...prevFrame.value]);
      momentumRef.current = simulateParticle2D(
        momentumRef.current,
        { velocityMagnitudeMax: 0.1 },
        [acceleration[0] * 0.0003, acceleration[1] * 0.0003],
        delta
      );
      prevFrame = frame;
    }

    camera.position.set(
      -momentumRef.current.position[0],
      40,
      momentumRef.current.position[1] - 40
    )
    camera.lookAt(new Vector3(
      -momentumRef.current.position[0],
      0,
      momentumRef.current.position[1],
    ))
  }, interval);
  return () => {
    clearInterval(id);
  }
}, [interval])
```

> #### Interval
> With Keyboard Track, input events should be
> framerate-indepentant. Set it to as high as you like,
> and you should still be able to move the camera (eventually)
> with the between-frame updates.
> ::interval

::demo{name=track}