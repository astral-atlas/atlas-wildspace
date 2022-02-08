# Scenes

Wildspace's Session typically has a single active "scene", which represents the primary
content the session is experiencing.

:::type
```
{
  type: "assignment",
  name: "Scene",
  value: { type: "union", values: [
    { type: "opaque", name: "ExpositionScene" },
    { type: "opaque", name: "WorldMapScene" },
  ] }
}
```
:::

There are different kinds of "scenes":
 - [ ] EncounterMapScene
 - [ ] WorldMapScene
 - [ ] ExpositionScene

## Exposition Scene

::demo{name=location_exposition}