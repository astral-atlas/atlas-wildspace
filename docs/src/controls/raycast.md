# Raycast Controls

## Click Raycast

:::api{name=useClickRay}
```ts
import {
  useClickRay,
  useClickRayContextValue
} from '@astral-atlas/wildspace-components';
```

```ts
const ref = useRef();

useClickRay(ref, (event, intersection, allIntersections) => {
  if (intersection !== allIntersections[0])
    return;
  event.preventDefault();
  materialRef.current.color = new Color(`hsl(${Math.random() * 255}, 75%, 75%)`)
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
```

::demo{name=click}
:::