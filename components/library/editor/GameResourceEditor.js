// @flow strict
/*::
import type { GameCRUDClient, GameResourceClient } from "../../../client2/game/meta";
import type { AdvancedGameCRUDAPIDescription } from "../../../models/api/game/meta";
import type {
  Game, GamePage, Tag, TagID,
  GameAPI,
} from "@astral-atlas/wildspace-models";
import type { GameMetaResource } from "../../../models/game/meta";
import type { FormSchema } from "../LibraryEditorForm";
import type { LibrarySelection } from "../librarySelection";

import type { Component } from "@lukekaalim/act";
import type { Cast } from "@lukekaalim/cast";
*/
import { emptyRootNode } from "@astral-atlas/wildspace-models";
import { randomSoftColor } from "@astral-atlas/wildspace-test/mocks/random";
import { h } from "@lukekaalim/act";
import { EditorForm, EditorTextInput } from "../../editor/form";
import { TagDropdown } from "./tags/TagDropdown";
import { renderLibraryEditorForm } from "../LibraryEditorForm";

/*::
export type GameResourceEditorProps = {
  gamePage: GamePage,
  resources: $ReadOnlyArray<GameMetaResource<any, string>>,

  selection: LibrarySelection,

  schema: FormSchema<>,
  castResource: Cast<any>,
  client: GameResourceClient<any>,
  tagClient?: GameResourceClient<GameAPI["/games/tags"]>,
};
*/

export const GameResourceEditor/*: Component<GameResourceEditorProps>*/ = ({
  schema,
  client,
  gamePage,
  resources,
  selection,
  tagClient,
  castResource,
}) => {
  const { game } = gamePage;
  const selectedResources = resources.filter(r => selection.selected.has(r.id));
  const selectedResource = selectedResources[0] || null;

  const onResourceChange = async (resourceProps) => {
    if (!selectedResource)
      return;
    const nextResource = {
      ...selectedResource,
      ...resourceProps,
    };
    client.update(gamePage.game.id, selectedResource.id, nextResource)
      .then(console.error);
  }
  const onCreateNewTag = async (newTagTitle) => {
    if (!tagClient)
      return;
    await tagClient.create(game.id, {
      color: randomSoftColor(),
      visibility: { type: 'game-master-in-game' },
      title: newTagTitle,
      description: emptyRootNode.toJSON(),
      tags: [],
    })
  }


  return [
    selectedResource && h(EditorForm, {}, [
      h(EditorTextInput, { disabled: true, label: 'ID', text: selectedResource.id }),
      h(EditorTextInput, {
        label: 'Title', text: selectedResource.title,
        onTextChange: title => onResourceChange({ title }),
      }),
      renderLibraryEditorForm(schema, selectedResource, onResourceChange, castResource),
      h(TagDropdown, {
        allTags: gamePage.tags,
        selectedTagsIds: selectedResource.tags,
        onSelectedTagIdsChange: tags => onResourceChange({ tags }),
        allowNewTagCreation: !!tagClient,
        onCreateNewTag,
      })
    ]),
  ];
};
