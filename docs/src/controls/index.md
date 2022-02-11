# Controls

Wildspace is a highly interactive website - responsive both to
mouse movements, keyboard controls and other input schemas.

Often the standard tooling isn't sufficient to capture all the useful
edge cases, so wildspace components provides additional functionality
to capture complex inputs.

## [Keyboard](./controls/keyboard)
Keyboard controls are used for Session navigation as well as
camera manipulation or fine model controls.

## [Raycast](./controls/raycast)
Clicking on elements in a three scene is a common way to indicate
selection or activity - determining what objects need to be informed
of raycast intersections from click actions is an important
part of the component api.