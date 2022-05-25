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

## SceneRenderer

Scenes are actually broken into two components:
  - [ ] SceneBackgroundRenderer
  - [ ] SceneRenderer

This is so that the background can be indiviually shown behind
elements that aren't specifically the scene content.

::demo{name=location_exposition}

## EncounterScene

::demo{name=encounter}