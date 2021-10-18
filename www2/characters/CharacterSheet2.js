// @flow strict
import { FeatureDivider } from "@astral-atlas/wildspace-components";
import { h } from '@lukekaalim/act';

export const CharacterSheet2/*: Component<>*/ = () => {
  return [
    h(FeatureDivider, {}, [
      h('div', {}, [
        h(CharacterSheetIdentity),
      ]),
      h('div', {}, [
        h(CharacterSheetStats),
      ]),
      h('div', {}, [
        h(CharacterSheetDisplay),
      ]),
    ]),
  ];
};