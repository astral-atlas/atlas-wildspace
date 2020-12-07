// @flow strict
/*:: import type { Commit, Props } from '@lukekaalim/act'; */
const { createInterface } = require('readline');
const { inspect } = require('util');
const { node, createGraph } = require('@lukekaalim/act');

const CharacterList = ({ characters }) => {
  return [
    ...characters.map(character => node('text', { content: character }))
  ];
}

/*::
type AppProps = {
  initialCharacters: string[],
};
*/
const App = ({ initialCharacters }/*: AppProps*/, [], { useState, useEffect }) => {
  const [characters, setCharacters] = useState(initialCharacters);

  useEffect(() => {
    const readLine = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const keyPressListener = (c, key) => {
      if (key.name === 'backspace')
        setCharacters(characters.slice(0, characters.length - 1))
    };
    process.stdin.on('keypress', keyPressListener);
    readLine.on('line', line => setCharacters([...characters, line]));
    
    return () => {
      process.stdin.off('keypress', keyPressListener);
      readLine.close();
    };
  }, [characters]);

  return [
    node('text', { content: 'Characters:' }),
    node(CharacterList, { characters }),
  ];
};

const textGraph = (root) => {
  const commitToText = (commit, depth = 0) => {
    if (commit.node.type === 'text') {
      const content = commit.node.props?.content;
      if (typeof content === 'string')
        return content.padStart(depth * 2, ' ');
      return ''.padStart(depth * 2, ' ');
    }
    
    return commit.childCommits
      .map(child => commitToText(child, depth + 2))
      .join('\n');
  }

  const handleEvent = () => {
    console.clear();
    console.log(commitToText(graph.getRoot()));
  }

  const graph = createGraph(root, setImmediate);
  graph.listen(() => handleEvent());
};

textGraph(node(App, { initialCharacters: ['luke', 'dave'] }));
