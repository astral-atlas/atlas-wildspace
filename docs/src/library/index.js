// @flow strict
/*::
import type { Page } from "..";
*/
import { Document, Markdown } from "@lukekaalim/act-rehersal";
import { h, useState } from "@lukekaalim/act";

import libraryText from './index.md?raw';
import libraryPrepText from './prep.md?raw';
import {
  LibraryBook, useLibrarySelection,
  EditorForm, EditorTextInput, EditorCheckboxInput, LibraryShelf, EditorButton, LibraryCatalogue, Library, SelectEditor, useSelection, PlayerPrepLibrary
} from "@astral-atlas/wildspace-components";
import { LayoutDemo, ScaledLayoutDemo } from "../demo";
import { v4 as uuid } from 'uuid';
import { LibraryAisle } from "@astral-atlas/wildspace-components/library/LibraryAisle";
import { createMockCharacter, createMockImageAsset, createMockWildspaceClient } from "@astral-atlas/wildspace-test"
import { GameMasterPrepLibraryDemo } from "./prep";
import { WidePage } from "../page";

const BookDemo = () => {
  const selection = useLibrarySelection()
  const [title, setTitle] = useState('Demo Book');
  const [id, setId] = useState('DEMO_ID');
  const [coverURL, setCoverURL] = useState('http://placekitten.com/200/300');

  return [
    h(LibraryBook, {
      id,
      selection,
      title,
      coverURL,
    }),
    h('hr'),
    h(EditorForm, {}, [
      h(EditorTextInput, { text: title, onTextInput: text => setTitle(text), label: 'Title' }),
      h(EditorTextInput, { text: id, onTextInput: text => setId(text), label: 'Id' }),
      h(EditorTextInput, { text: coverURL, onTextInput: text => setCoverURL(text), label: 'CoverURL' }),
      h(EditorCheckboxInput, {
        checked: selection.selected.has(id),
        onCheckedChange: (checked) => selection.replace(checked ? [id] : []),
        label: 'Selected'
      })
    ])
  ]
}

const ShelfDemo = () => {
  const selection = useLibrarySelection()
  const [books, setBooks] = useState([
    {
      id: 'DEMO_ID_A',
      title: 'Example Title A',
    },
    {
      id: 'DEMO_ID_B',
      title: 'Example Title B ',
    },
    {
      id: 'DEMO_ID_C',
      title: 'Example Title C',
    },
  ])

  return [
    h(LayoutDemo, {}, [
      h(LibraryShelf, { selection, books, title: "Test Shelf" }),
    ]),
    h(EditorForm, {}, [
      h(EditorButton, { label: 'Add Book', onButtonClick: () => setBooks([...books, { id: uuid(), title: 'Untitled' }])  }),
    ])
  ]
}

const CatalogueDemo = () => {
  const [activeAisleId, setSctiveAisleId] = useState('DEMO_AISLE_A');
  const aisles = [
    { id: 'DEMO_AISLE_A', title: 'Characters' },
    { id: 'DEMO_AISLE_B', title: 'Magic Items' },
    { id: 'DEMO_AISLE_C', title: 'Wiki Pages' },
    { id: 'DEMO_AISLE_D', title: 'Player Settings', color: 'teal' },
  ];
  return [
    h(LayoutDemo, {}, [
      h(LibraryCatalogue, { aisles, activeAisleId, onActivateAisle: id => setSctiveAisleId(id) }),
    ]),
    h(EditorForm, {}, [
      h(SelectEditor, {
        label: 'Selected Aisle',
        selected: activeAisleId, 
        values: aisles.map(a => ({ value: a.id, title: a.title })),
        onSelectedChange: id => setSctiveAisleId(id) })
    ])
  ]
}

const LibraryDemo = () => {
  const [activeAisleId, setSctiveAisleId] = useState('DEMO_AISLE_A');
  const selection = useLibrarySelection();
  const aisles = [
    { id: 'DEMO_AISLE_A', title: 'Characters', shelves: [
      { title: 'Shelf A', books: [
        { id: 'DEMO_A', title: 'Book A' },
        { id: 'DEMO_B', title: 'Book B' },
        { id: 'DEMO_C', title: 'Book C' },
      ] },
      { title: 'Shelf B', books: [
        { id: 'DEMO_D', title: 'Book D' },
      ] },
    ] },
    { id: 'DEMO_AISLE_B', title: 'Magic Items', shelves: [
      { title: 'Shelf C', books: [
        { id: 'DEMOE', title: 'Book E' },
      ] },
    ] },
  ];
  const activeAisle = aisles.find(a => a.id === activeAisleId)
  const selectedBook = aisles
    .map(a => a.shelves.map(s => s.books).flat(1))
    .flat(1)
    .find(b => selection.selected.has(b.id))

  return [
    h(ScaledLayoutDemo, {}, [
      h(Library, {
        catalogue: [
          h(LibraryCatalogue, { aisles, activeAisleId, onActivateAisle: id => setSctiveAisleId(id) }),
        ],
        aisle: h(LibraryAisle, {
          floor: !!activeAisle && activeAisle.shelves.map(shelf =>
            h(LibraryShelf, {
              selection,
              title: shelf.title,
              books: shelf.books,
            })),
          desk: [!!selectedBook && h(EditorForm, {}, [
            h(EditorTextInput, { label: 'Title', text: selectedBook.title })
          ])]
        }),
      })
    ])
  ]
}

const PlayerPrepDemo = () => {
  const data = [
    { c: createMockCharacter(), i: createMockImageAsset(), },
    { c: createMockCharacter(), i: createMockImageAsset(), },
    { c: createMockCharacter(), i: createMockImageAsset(), },
  ];
  const characters = data.map(({ c, i }) => ({
    ...c,
    initiativeIconAssetId:i.description.id
  }))
  const assets = new Map(data.map(({ i }) => (
    [i.description.id, i]
  )));

  const game = {
    id: 'GAME_0',
    gameMasterId: 'GM',
    name: 'GAME ZERO'
  };
  const userId = '';
  const client = createMockWildspaceClient();

  return [
    h(ScaledLayoutDemo, {}, [
      h(PlayerPrepLibrary, { characters, assets, client, catalogueHeader: h('h2', {}, 'Header Test'), game, userId })
    ])
  ];
}

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'book':
      return h(BookDemo);
    case 'shelf':
      return h(ShelfDemo);
    case 'catalogue':
      return h(CatalogueDemo);
    case 'library':
      return h(LibraryDemo);
    case 'player_prep':
      return h(PlayerPrepDemo);
    case 'gm_prep':
      return h(GameMasterPrepLibraryDemo)
    default:
      return null;
  }
}

const directives = {
  'demo': Demo,
}

export const libraryPrepPage/*: Page*/ = {
  content: h(WidePage, {}, h(Markdown, { text: libraryPrepText, directives })),
  link: { children: [], name: 'Prep Library', href: '/library/prep' }
}

export const libraryPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: libraryText, directives })),
  link: { children: [
    libraryPrepPage.link
  ], name: 'Library', href: '/library' }
}

export const libraryPages = [
  libraryPage,
  libraryPrepPage,
];
