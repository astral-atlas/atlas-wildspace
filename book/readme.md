# @astral-atlas/wildspace-book

A component preview site, for viewing, experimenting, and editing components used for wildspace.

## Data Fetching

Wildspace provides visual components and logical hooks for your application, but does not provide any way to edit or update remote data. Consider the `@astral-atlas/wildspace-client` for that purpose.

## Requirements

The components here are not react components, but [@lukekaalim/act](https://github.com/lukekaalim/act) components.
You will need an act renderer to view them. Your renderer must support _dom elements_ for 2d components, and _three elements_ for 3d components.
You can use the [@lukekaalim/act-three](https://github.com/lukekaalim/act/renderer/three) renderer to provide this implementation.

These components also import stylesheets, gltf, and other resources, assuming that those imports result in URLs for these assets. Use a tool like [vite](https://vitejs.dev/) or [webpack](https://webpack.js.org/) to bundle your app and resolve these imports.

## Usage

Install the components package by running

```bash
npm install @astral-atlas/wildspace-components
```

and add them to your act project.

```js
import { ProficencyInput } from '@astral-atlas/wildspace-components';
import { h } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-three';

const App = () => {
  return [
    h(ProficencyInput, { label: 'proficency', value: 2 }),
  ]
};

render(h(App), document.body);
```