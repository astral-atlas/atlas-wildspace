// @flow strict
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */

import { createContext, h } from "@lukekaalim/act";
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import audioText from './index.md?raw';
import { TrackLibraryDemo } from "./track";
import { PlaylistLibraryDemo } from "./playlist";

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'track_library':
      return h(TrackLibraryDemo);
    case 'playlist_library':
      return h(PlaylistLibraryDemo)
    case 'player':
    default:
      throw new Error();
  }
};

const directives = {
  demo: Demo,
}

export const audioPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: audioText, directives })),
  link: { children: [
    
  ], name: 'Audio', href: '/assets/audio' }
}

export const audioPages/*: Page[]*/ = [
  audioPage,
];