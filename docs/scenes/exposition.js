// @flow strict
import { h } from "@lukekaalim/act";

/*::
export type Scene =
  | LocationExpositionScene

export type LocationExpositionScene = {
  type: 'location',
  location: Location,
};

export type ImageGraphic = {
  type: 'image',
  source: string,
  alternativeText: string,
}

export type Graphic =
  | ImageGraphic

export type Location = {
  name: string,
  description: string,
  background: Graphic
};
*/

const ExpositionSceneRenderer = () => {
  return h();
};

const ImageGraphicRenderer = () => {
  return h('img', {});
}