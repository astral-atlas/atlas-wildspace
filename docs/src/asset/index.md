# Assets

Assets are a catch-all term for all the large, typically binary files authored in external
tooling, like audio files, image files, 3d models, textures and even embedded documents such as
PDF's.

Assets are typically _uploaded_ by a game master, and _viewed_ by a player.

Assets may
also have some meta information that describes them in more specific detail. 

## Asset Grid

An asset grid is a generic collection of assets displayed in a 2d grid in a
fixed size (and aspect ratio).
Different components that manage lists of assets might have different controls.
This demo grid simply contains a 100% sized randomly colored grid.

::demo{name=assetGrid}