# Library

This component provides build blocks for constructing a user interface for creating, editing, managing and deleting
different types (and groups!) of content.

![](/library_sketch.png)

The core idea is to provide a consistent and scalable UI for different types of "things" you might edit. For example,
a user might manage both Characters and Magic Items. They typically manage more than "one" of these things, so the UI
for selecting, editing, and deleting these things should be similar at a top-level, but also customizable at a lower one
so developers have ample room to implement the custom behaviours that make magic items different for characters, for example.

We use the metaphor of a "library" of content here, where the user is browsing through "Aisles" of content (types of content),
and then examining groups of related content "shelves" before looking at an indiviual "book" (specific resource).

## Components
 - Library
 - LibraryCatalogue
 - LibraryShelf
 - LibraryBook

## Hooks
 - [useLibrarySelection](#useLibrarySelection)

::::api{name=useLibrarySelection}

_From `@astral-atlas/wildspace-components`_

A hook for managing arbitrary string-id based multi-selection.

:::type
```
{
  type: "assignment",
  name: "useLibrarySelection",
  value: { type: "function", arguments: [], returns: {
    type: 'opaque', name: 'LibrarySelection'
  } }
}
```
:::

:::type
```
{
  type: "assignment",
  name: "LibrarySelection",
  value: {
    type: "object",
    entries: [
      { key: "selection", value: { type: "opaque", name: "Set", genericArguments: [{ type: "opaque", name: "string" }] } },
      { key: "append", value: { type: "function", arguments: [], returns: { type: "opaque", name: "void" } }},
      { key: "replace", value: { type: "function", arguments: [], returns: { type: "opaque", name: "void" } }},
    ]
  }
}
```
:::

This hooks provides a `LibrarySelection`, which is a common interface consumed by most Library components.

Using it, you can select, deselect, group-select and toggle selection of "ids" that your resource must implement.


### Example: Replace Select
Invoking this function will replace all selected elements with this element.
```ts
const id = 'my_id';
const onClick = () => {
  selection.replace([id])
};
return h('button', { onClick }, `Select ${id}`);
```

::::

## LibraryBook

A single editiable and selectable item with a unique ID and human-readable title.
Might have a "cover", if not, it's uses a color based on the ID.

![](/book_sketch.png)

::demo{name=book}

## LibraryShelf

An unordered set of "Books", sometimes representing a subsection.

The Shelf itself won't scroll, it will just expand to accomodate more books.

::demo{name=shelf}

## LibraryCatalogue

A menu for selecting different views of the main aisle.

::demo{name=catalogue}

## Library

::demo{name=library}