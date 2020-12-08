// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { Character } from '@astral-atlas/wildspace-models'; */
import { Fragment, h } from 'preact';
import { useStore } from '../context/appContext';
import { useAsync } from '../hooks/useAsync';
import { CharacterCard } from '../components/cards/character';
import { useWildspaceClient } from '../hooks/useWildspace';
import { useSpring, animated } from 'react-spring';
window.a = true && useSpring && animated;

export const style = `
  .home-page {
    position: relative;
    width: 100%;
    padding: 25px;
    box-sizing: border-box;
  }
  .rail {
    width: 100%;
    list-style-type: none;
    margin: 0;
    padding: 0;

    display: flex;
    flex-direction: row;
  }
  .rail-element {
    margin-left: 25px;
    margin-right: 25px;
  }
  .rail-element:first-child {
    margin-left: 0px;
  }
  .rail-element:last-child {
    margin-right: 0px;
  }
`;

const Rail = ({ elements }) => {
  return h('ul', { class: 'rail' }, [
    ...elements.map(element => h('li', { class: 'rail-element' }, [element]))
  ]);
};

const CharacterRails = () => {
  const [store] = useStore();
  const client = useWildspaceClient();
  const self = store.user.selfDetails;

  const [characters] = useAsync/*:: <Character[]>*/(async () => {
    if (self.type !== 'logged-in')
      return [];
    if (!store.game.activeGameId)
      return [];
    return await client.game.getCharactersInGame(store.game.activeGameId);
  }, [client, store.game.activeGameId]);

  if (self.type !== 'logged-in')
    return null;
  const user = self.user;

  if (!characters)
    return null;

  if (user.type === 'player') {
    const player = user.player;
    const myCharacters = characters.filter(c => c.player === player.id);
    const otherCharacters = characters.filter(c => c.player !== player.id);
    
    return h(Fragment, {}, [
      myCharacters.length > 0 && h('h2', {}, 'My Characters'),
      myCharacters.length > 0 && h(Rail, { elements: myCharacters.map(character =>
        h(CharacterCard, { character })) } ),
      otherCharacters.length > 0 && h('h2', {}, 'Other Characters'),
      otherCharacters.length > 0 && h(Rail, { elements: otherCharacters.map(character =>
        h(CharacterCard, { character })) } ),
    ]);
  } else {
    return h(Fragment, {}, [
      characters.length > 0 && h('h2', {}, 'Characters'),
      characters.length > 0 && h(Rail, { elements: characters.map(character =>
        h(CharacterCard, { character })) } ),
    ]);
  }
}

const HomePage = ()/*: Node*/ => {

  return h('main', { class: 'home-page' }, [
    h(CharacterRails),
  ])
};

export {
  HomePage,
};