// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { Character } from '@astral-atlas/wildspace-models'; */

import { h } from "preact";

export const style = `
  .character-card {
    border: 1px solid black;
    padding: 15px;
    box-shadow: 0 5px 15px #0000004f; 
    transition: box-shadow 0.2s, transform 0.2s;
    transform: scale(1);

    display: flex;
    flex-direction: column;
    align-items: center;
    width: 210px;
  }
  .character-card:hover {
    transform: scale(1.1);
    box-shadow: 0 20px 25px #0000002e; 
  }

  .character-card-title {
    text-align: center;
    margin: 0;
    height: 2em;
    overflow: auto;
  }
  .character-card-attributes {
    width: 100%;
    display: flex;
    flex-direction: row;
  }
  .character-card-description {
    height: 80px;
    overflow: auto;
    margin: 8px;
  }
  .character-card-attributes tr {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    margin-left: 5px;
    margin-right: 5px;
  }
  .character-card-attributes th {
    text-align: right;
  }
`;

/*::
type Props = {
  character: Character,
};
*/

const CharacterCard = ({ character }/*: Props*/)/*: Node*/ => {
  return h('article', { class: 'character-card' }, [
    h('h4', { class: 'character-card-title' }, character.name),
    h('img', { class: 'character-card-portrait', src: character.imageURL, width: '100', height: '100' }),
    h('p', { class: 'character-card-description' }, character.description),

    h('table', { class: 'character-card-attributes' }, [
      h('tr', {}, [
        h('th', {}, 'Armor Class'),
        h('th', {}, 'Hitpoints'),
      ]),
      h('tr', {}, [
        h('td', {}, character.armorClass),
        h('td', {}, character.hitPoints),
      ])
    ])
  ]);
};

export {
  CharacterCard,
}