// @flow strict

import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  headerCase,
  noCase,
  paramCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase,
} from "change-case";

/*::
export type StyleSelector =
  | { type: 'class', name: string, }
  | { type: 'element', name: string, }
  | { type: 'id', name: string, }

export type StyleRule = {
  propertyName: string,
  propertyValue: string,
};

export type StyleBlock = {
  selectors: StyleSelector[],
  rules: StyleRule[],
};

export type StyleAtRule =
  | { type: 'import', url: string }
  | { type: 'font-face', fontFamily: string, src: { src: string, format: string }[] }

export type StyleSheet = {
  blocks: StyleBlock[],
  atRules: StyleAtRule[],
};
*/

const renderRule = (rule/*: StyleRule*/) => {
  if (!rule.propertyName || !rule.propertyValue)
    return '';
  return `${rule.propertyName}: ${rule.propertyValue};`;
};
const renderSelector = (selector/*: StyleSelector*/) => {
  switch (selector.type) {
    case 'class':
      return `.${selector.name}`;
    case 'id':
      return `#${selector.name}`;
    case 'element':
      return `${selector.name}`;
  }
};
const renderBlock = (block/*: StyleBlock*/) => {
  if (block.selectors.length < 1 || block.rules.length < 1)
    return '';
  const selectors = block.selectors
    .map(renderSelector)
    .join(', ');
  const rules = block.rules
    .map(renderRule)
    .map(rule => rule.padStart(1 + rule.length, '\t'))
    .join('\n');

  return `${selectors} {\n${rules}\n}`;
};
const renderAtRule = (atRule/*: StyleAtRule*/) => {
  switch (atRule.type) {
    case 'import':
      return `@import ${atRule.url};`
    case 'font-face':
      throw new Error('Unimplemented');
  }
};

const renderStyleSheet = (sheet/*: StyleSheet*/)/*: string*/ => {
  const atRules = sheet.atRules.map(renderAtRule).join('\n');
  const blocks = sheet.blocks.map(renderBlock).join('\n');

  return [
    '/* === Meta === */',
    atRules,
    '',
    '/* === Blocks === */',
    blocks
  ].join('\n')
};

/*::
type RuleProps = {
  display?: 'flex' | 'block' | 'inline',
  alignItems?: 'start' | 'end' | 'center',
  flexDirection?: 'row' | 'column',
  ...
};
*/

const cssClass = (name/*: string*/, props/*: RuleProps*/)/*: StyleBlock*/ => {
  const rules = Object
    .entries(props)
    .map(([name, value]) => ({ propertyName: paramCase(name), propertyValue: value }));
  
  return {
    selectors: [{ type: 'class', name }],
    rules,
  };
};
const cssElement = (name/*: string*/, props/*: RuleProps*/)/*: StyleBlock*/ => {
  const rules = Object
    .entries(props)
    .map(([name, value]) => ({ propertyName: paramCase(name), propertyValue: value }));
  
  return {
    selectors: [{ type: 'element', name }],
    rules,
  };
};
const cssStylesheet = (blocks/*: StyleBlock[]*/, atRules/*: StyleAtRule[]*/ = [])/*: StyleSheet*/ => {
  return {
    atRules,
    blocks,
  };
};

export {
  cssStylesheet,
  cssClass,
  cssElement,
  renderStyleSheet,
};