// @flow strict


/*::
import type { Component } from '@lukekaalim/act';
import type {
  Game, Character,
  Scene, SceneID,
  Exposition,
  MiniTheater,
  Location,
} from '@astral-atlas/wildspace-models';
import type { UserID } from "@astral-atlas/sesame-models";

import type { AssetDownloadURLMap } from "../../asset/map";
import type { WildspaceClient } from '@astral-atlas/wildspace-client2';
*/

import { h, useEffect, useRef, useState } from "@lukekaalim/act"
import { useLibrarySelection } from "../librarySelection";
import { LibraryAisle } from "../LibraryAisle";
import { LibraryShelf } from "../LibraryShelf";
import { EditorForm, EditorButton, EditorTextInput } from "../../editor";
import { PopupOverlay } from "../../layout";
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { CharacterSheet } from "../../paper/CharacterSheet";
import debounce from "lodash.debounce";
import { SelectEditor } from "../../editor/form";

/*::
export type ExpositionAisleProps = {
  game: Game,
  userId: UserID,
  
  expositions: $ReadOnlyArray<Exposition>,
  locations: $ReadOnlyArray<Location>,

  assets: AssetDownloadURLMap,

  client: WildspaceClient
}
*/

export const ExpositionAisle/*: Component<ExpositionAisleProps>*/ = ({
  game,
  userId,

  expositions,
  locations,

  assets,
  client,
}) => {
  const selection = useLibrarySelection();

  const selectedExposition = expositions.find(c => selection.selected.has(c.id));

  const [stagingName, setStagingName] = useState('')

  const onCreateNewExposition = async () => {
    await client.game.exposition.create(game.id, { name: stagingName });
  }
  const onDeleteExposition = async (exposition) => {
    await client.game.exposition.destroy(game.id, exposition.id);
  }

  return [
    h(LibraryAisle, {
      floor: h(LibraryFloor, {}, [
        h(LibraryFloorHeader, { title: 'Expositions', }, [
          h(EditorForm, {}, [
            h(EditorButton, { label: 'Create new Scene', onButtonClick: () => onCreateNewExposition() }),
            h(EditorTextInput, { label: 'Title', text: stagingName, onTextInput: setStagingName }),
          ]),
        ]),
        h(LibraryShelf, { title: 'All Expositions', selection, books: expositions.map(e => ({
          title: e.name,
          id: e.id,
        })) }),
      ]),
      wideDesk: true,
      desk: [
        !!selectedExposition && h(ExpositionEditor, {
          game,
          exposition: selectedExposition,
          locations,
          client
        })
      ]
    }),
  ];
};

const ExpositionEditor = ({ game, exposition, locations, client }) => {
  const { name } = exposition;
  const onUpdateExposition = async (nextExposition) => {
    await client.game.exposition.update(game.id, exposition.id, { ...exposition, ...nextExposition });
  }
  const onDeleteExposition = async () => {
    await client.game.exposition.destroy(game.id, exposition.id);
  }

  const onUpdateSubject = async (index, nextSubject) => {
    if (!nextSubject)
      await onUpdateExposition({
        ...exposition,
        subjects: exposition.subjects.filter((s, i) => i !== index)
      })
    else
      await onUpdateExposition({
        ...exposition,
        subjects: exposition.subjects.map((s, i) => i === index ? {
          ...s,
          ...nextSubject,
        } : s)
      })
  }
  const onAddSubject = async (nextSubject) => {
    setStagingSubject(null);
    await onUpdateExposition({
      ...exposition,
      subjects: [...exposition.subjects, nextSubject]
    })
  }

  const [statingSubject, setStagingSubject] = useState(null);

  return h(EditorForm, {}, [
    h(EditorTextInput, { label: 'Name', text: name, onTextInput: debounce(name => onUpdateExposition({ name }), 1000) }),
    h(EditorButton, { label: 'Delete Exposition', onButtonClick: () => onDeleteExposition() }),
    h('ol', {}, exposition.subjects.map((subject, index) => h('li', { key: getValueOfSubject(subject) + index }, [
      h(ExpositionSubjectEditor, {
        label: 'Edit Subject',
        subject,
        locations,
        onUpdateSubject: s => onUpdateSubject(index, s) })
    ]))),
    h(ExpositionSubjectEditor, {
      key: 'None',
      label: 'Select Subject to Add',
      subject: statingSubject,
      locations,
      onUpdateSubject: s => setStagingSubject(s)
    }),
    h(EditorButton, { label: 'Add Subject', disabled: !statingSubject, onButtonClick: () => statingSubject && onAddSubject(statingSubject) }),

  ])
}
const getValueOfSubject = (subject) => {
  switch (subject.type) {
    case 'location':
      return `location:${subject.locationId}`
    default:
      return '';
  }
}
const getSubjectOfValue = (value, locationValues) => {
  const location = locationValues.get(value)
  if (location)
    return { type: 'location', locationId: location.id }
  return null;
}

const ExpositionSubjectEditor = ({ label = '', subject = null, locations, onUpdateSubject }) => {
  const locationValues = new Map(locations.map(l => [`location:${l.id}`, l]));

  const selected = subject && getValueOfSubject(subject) || '';

  const ref = useRef();
  useEffect(() => {
    const { current: select } = ref;
    if (!select)
      return;
    select.value = subject && getValueOfSubject(subject) || '';
  }, [subject])
  
  return [
    h(SelectEditor, {
      ref,
      label,
      groups: [
        {
          title: 'locations',
          values: [...locationValues].map(([value, location]) =>
            ({ value, title: location.title }))
        },
      ],
      values: [{ value: '', title: 'None' }],
      selected,
      onSelectedChange: (value) => {
        const subject = getSubjectOfValue(value, locationValues);
        onUpdateSubject(subject)
      }
    }),
  ]
}