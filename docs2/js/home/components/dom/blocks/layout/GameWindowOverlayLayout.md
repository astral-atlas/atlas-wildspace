# Game Window Overlay Layout

A Game Window Overlay is a set of UI that appears
over a game window, things like 3D Previews,
Scene MiniTheaters and other things.

It's mostly used to anchor UI elements into corners
of the screen with a bit of padding.

The `GameWindowOverlayLayout` component itself doesnt
do much except setup styles for it's children.

::GameWindowOverlayLayoutDemo

It's accompanied by a `GameWindowOverlayAnchor`, which
denotes a flex column context to arrange corner content.

```ts
export type GameWindowOverlayAnchorProps = {
  va: 'top' | 'bottom', // Vertical Alignment
  ha: 'left' | 'right' // Horizontal Alignment
}
```

You can then insert either:
  - `GameWindowOverlayExpandingIcon`
  - `GameWindowOverlayButton`
  - `GameWindowOverlayBox`

to fill out UI elements.