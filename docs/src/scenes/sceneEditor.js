// @flow strict
/*::
import type { Page } from "..";
import type { Component } from "@lukekaalim/act";
import type { UpdatesConnection } from "@astral-atlas/wildspace-client2";
import type { LibraryData } from "@astral-atlas/wildspace-models"
*/

import { WidePage } from "../page";
import { createAssetDownloadURLMap, SceneContentEditor, useAsync } from "@astral-atlas/wildspace-components"
import { h, useMemo, useState } from "@lukekaalim/act"
import { Document } from "@lukekaalim/act-rehersal";
import { ScaledLayoutDemo } from "../demo";
import { createMockLibraryData } from "../../../test/mocks/library";
import { createMockWildspaceClient } from "../../../test/mocks/client";
import { reduceMiniTheaterAction } from "@astral-atlas/wildspace-models";
import { v4 } from "uuid";

export const SceneEditorDemo/*: Component<>*/ = () => {
  const [library, setLibrary] = useState/*:: <LibraryData>*/(createMockLibraryData());
  const client = createMockWildspaceClient(() => library, library => setLibrary(library));
  const assets = createAssetDownloadURLMap(library.assets);

  const initialContent = {
    type: 'none'
  };
  const [content, setContent] = useState(initialContent);
  const onContentUpdate = (nextContent) => {
    setContent(nextContent);
  };
  const [connection] = useAsync(async () => await client.updates.create('gameId'), []);

  return [
    h(ScaledLayoutDemo, {},
      connection && h(SceneContentEditor, {
        content, onContentUpdate, library, client, assets,
        connection
      })
    ),
    h('code', {}, h('pre', {}, JSON.stringify(content, null, 2)))
  ]
}

export const sceneEditorPage/*: Page*/ = {
  content:
    h(WidePage, {},
        h(SceneEditorDemo)),
  link: {
    name: 'Scene Editor',
    href: '/scenes/editor',
    children: [],
  }
}