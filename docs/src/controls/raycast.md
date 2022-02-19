# Raycast Controls

## Click Raycast

:::api{name=useRaycast}
```ts
import {
  useRaycastManager,
  useRaycast
} from '@astral-atlas/wildspace-components';
```

Adds an object to a context-driven raycast manager to be listened to
for raycast events.

The manager maintains a "focus" object each update - and dispatches
enter/exit events to elements as the focus object changes.

```ts
const boxGeometry = new BoxGeometry(2, 2, 2);

const MyBox = ({ position }) => {
  const ref = useRef();
  const [selected, setSelected] = useState(false);

  const spinColor = () => {
    materialRef.current.color = new Color(`hsl(${Math.random() * 255}, 75%, 75%)`)
  }
  const spinObject = () => {
    if (ref.current)
      ref.current.rotateZ(0.01 * Math.PI);
  }

  useRaycast(ref, {
    enter: spinColor,
    exit: () => setSelected(false),
    click: () => setSelected(true),
    over: spinObject,
  });

  const materialRef = useRef(new MeshBasicMaterial({ color: 'yellow' }))

  return [
    h(mesh, {
      ref,
      position,
      geometry: boxGeometry,
      material: materialRef.current
    })
  ];
};
```

::demo{name=click}
:::