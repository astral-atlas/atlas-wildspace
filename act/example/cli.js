// @flow strict
/*:: import type { Commit, Props } from '@lukekaalim/act'; */
const { createInterface } = require('readline');
const { node, createGraph, createContext } = require('@lukekaalim/act');

const CharacterList = ({ characters }, _, { useContext }) => {
  const app = useContext(appContext);

  return [
    ...characters.map(character =>
      node('text', { content: `${character} (${app[character] || 0})` }))
  ];
}

/*::
type AppProps = {
  initialCharacters: string[],
};
type AppContext = {
  [character: string]: number
};
*/
const appContext = createContext/*:: <AppContext>*/({ ratings: {} });

const App = ({ initialCharacters }/*: AppProps*/, [], { useState, useEffect }) => {
  const [characters, setCharacters] = useState(initialCharacters);
  const [ratings, setRatings] = useState/*::<{ [character: string]: number }>*/({});

  useEffect(() => {
    const readLine = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const keyPressListener = (c, key) => {
      const currentCharacter = characters[characters.length - 1];
      switch (key.name) {
        case 'backspace':
          return setCharacters(characters.slice(0, characters.length - 1))
        case 'left':
          return setRatings({
            ...ratings,
            [currentCharacter]: (ratings[currentCharacter] || 0) + 1
          })
        case 'right':
          return setRatings({
            ...ratings,
            [currentCharacter]: (ratings[currentCharacter] || 0) - 1
          })
      }
    };
    process.stdin.on('keypress', keyPressListener);
    readLine.on('line', line => setCharacters([...characters, line]));
    
    return () => {
      process.stdin.off('keypress', keyPressListener);
      readLine.close();
    };
  }, [characters, ratings]);

  return [
    node(appContext.Provider, { value: ratings }, [
      node('text', { content: 'Characters:' }),
      node(CharacterList, { characters }),
    ])
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
