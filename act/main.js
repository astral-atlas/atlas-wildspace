// @flow strict
/*:: import type { Result } from './result'; */
const { inspect } = require('util');
const { node } = require('./node');
const { renderer } = require('./dirty');


/*::
type Tree = {
  type: string,
  props: { [string]: mixed },
  children: Tree[],
};
*/

const getTree = (result/*: Result*/)/*: Tree[]*/ => {
  if (typeof result.node.type === 'function')
    return result.childResults.map(getTree).flat(1);
  
  return [{
    type: result.node.type,
    id: result.id,
    props: result.node.props,
    children: result.childResults.map(getTree).flat(1),
  }];
};

const Character = ({ name }, children, { useState, useEffect }) => {
  return [node('group', { name: 'character', id: name }, [
    node('arm'),
    node('leg'),
  ])]
}

const App = ({ initialCharacters }, _, { useState }) => {
  const [characters, setCharacters] = useState(initialCharacters);
  console.log(characters);

  return [
    node('hook', { setCharacters }),
    node('scene', {}, [
      node('light'),
      ...characters.map((name) => node(Character, { key: name, name })),
    ])
  ];
};

const getTreeHooks = (tree) => {
  return tree
    .map(node => node.type === 'hook' ? [node.props.setCharacters] : getTreeHooks(node.children))
    .flat(1)
};

const appResult = renderer(node(App, { initialCharacters: ['luke'] }), (event) => {
  console.log(event.type, (event.updated || event.created || event.removed).node.type)
});

const tree = getTree(appResult);
const [firstHook] = getTreeHooks(tree);


setTimeout(() => {
  firstHook(['luke', 'beth', 'carlo']);
  setTimeout(() => {
    firstHook(['luke', 'carlo']);
    debugger;
  }, 500);
  
}, 500);

