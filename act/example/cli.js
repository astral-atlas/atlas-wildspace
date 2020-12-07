// @flow strict
/*:: import type { Commit, Props } from '@lukekaalim/act'; */
const { inspect } = require('util');
const { node, createGraph } = require('@lukekaalim/act');

/*::
type Tree = {
  type: string,
  props: ?Props,
  children: Tree[],
};
*/

const getTree = (commit/*: Commit*/)/*: Tree[]*/ => {
  if (typeof commit.node.type === 'function')
    return commit.childCommits.map(getTree).flat(1);
  
  return [{
    type: commit.node.type,
    id: commit.statePath.join('\\'),
    props: commit.node.props,
    children: commit.childCommits.map(getTree).flat(1),
  }];
};

const Character = ({ name }, children, { useState, useEffect }) => {
  return [node('group', { name: 'character', id: name }, [
    node('arm'),
    node('leg'),
  ])]
}

/*::
type AppProps = {
  initialCharacters: string[],
};
*/
const App = ({ initialCharacters }/*: AppProps*/, [], { useState, useEffect }) => {
  const [characters, setCharacters] = useState(initialCharacters);
  useEffect(() => {
    const id = setTimeout(() => setCharacters(['luke', 'barry']), 100);
    return () => {
      clearTimeout(id);
    };
  }, []);

  return [
    node('hook', { setCharacters }),
    node('scene', {}, [
      node('light'),
      ...characters.map((name) => node(Character, { key: name, name })),
    ])
  ];
};

const graph = createGraph(node(App, { initialCharacters: ['luke'] }), setImmediate);
graph.listen(events => events.map(event => console.log(event.type, event.commit.node.type)));