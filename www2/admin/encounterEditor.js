// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { Encounter, Game, Character, CharacterID } from "@astral-atlas/wildspace-models"; */
/*:: import type { ListInputProps } from "@astral-atlas/wildspace-components"; */
import { h, useState } from '@lukekaalim/act';
import { c } from '@lukekaalim/cast';
import { useAPI } from '../hooks/api';
import { useURLParam } from '../hooks/navigation';
import { ListInput, MultiSelectInput, SelectInput, TextInput } from "@astral-atlas/wildspace-components";

/*::
export type EncounterEditorProps = {
  encounters: Encounter[],
  game: Game,
  characters: Character[],
};
*/

const NewEncounterEditor = ({ game }) => {
  const api = useAPI()
  const [name, setName] = useState('');

  const onClick = async () => {
    await api.game.encounter.create(game.id, name)
  };

  return [
    h(TextInput, { value: name, onChange: setName, label: 'name' }),
    h('button', { onClick }, 'Create')
  ]
}
const castVisibility = c.enums(['players', 'game-master']);

const ExistingEncounterEditor = ({ game, encounter, characters }) => {
  const api = useAPI()

  const onChange = async (updatedProps) => {
    api.game.encounter.update(game.id, encounter.id, { ...encounter, ...updatedProps });
  }

  return [
    h(TextInput, { disabled: true, value: encounter.id, label: 'id '}),
    h(TextInput, { value: encounter.name, onChange: name => onChange({ name }), label: 'name '}),
    h(MultiSelectInput, { label: 'Characters',
      onChange: characters => onChange({ characters }),
      selected: encounter.characters,
      options: characters.map(c => c.id),
      getOptionLabel: id => characters.find(c => c.id === id)?.name || ''
    }),
    h(SelectInput, { label: 'visibility',
      value: encounter.visibility,
      onChange: visibility => onChange({ visibility: castVisibility(visibility) }),
      values: ['players', 'game-master'] 
    }),

    h('button', { onClick: () => api.game.encounter.remove(game.id, encounter.id) }, 'Delete')
  ]
}

export const EncounterEditor/*: Component<EncounterEditorProps>*/ = ({ game, encounters, characters }) => {
  const [encounterId, setEncounterId] = useURLParam('encounterId');
  const encounter = encounters.find(e => e.id === encounterId) || null;

  return [
    h('select', { onChange: e => setEncounterId(e.target.value) }, [
      h('option', { selected: !encounterId, value: '' }, 'New Encounter'),
      encounters.map(e => h('option', { value: e.id, selected: encounterId === e.id }, e.name))
    ]),
    !encounter && h(NewEncounterEditor, { game }),
    encounter && h(ExistingEncounterEditor, { game, encounter, characters })
  ];
};