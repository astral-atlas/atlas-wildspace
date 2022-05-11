// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { WikiDoc, WikiDocID, GameID } from "@astral-atlas/wildspace-models";
import type { UserID } from "@astral-atlas/sesame-models";
*/

import { h, useState } from "@lukekaalim/act";
import { ProseMirror } from "../richText";
import { useCollaboratedEditorState } from "../richText/collab";
import { useGameConnection } from "./data";
import styles from './Wiki.module.css';

/*::
export type WikiProps = {
  api: WildspaceClient,
  userId: UserID,
  gameId: GameID,
  docs: $ReadOnlyArray<WikiDoc>,
};
*/

export const Wiki/*: Component<WikiProps>*/ = ({
  api,
  userId,
  gameId,
  docs,
}) => {
  const [, wiki] = useGameConnection(api, gameId);

  const [activeDoc, setActiveDoc] = useState(null)

  const [state, dispatchTransaction] = useCollaboratedEditorState(wiki, activeDoc, userId)

  return h('div', { className: styles.wiki }, [
    h('div', { className: styles.wikiContent }, [
      h('div', { className: styles.wikiControls }, [
        h('select', { onInput: e => setActiveDoc(e.target.value) }, [
          docs.map(doc =>
            h('option', { value: doc.id, selected: doc.id === activeDoc }, doc.title)),
          h('option', { value: null, selected: activeDoc === null }, 'None')
        ]),
      ]),
      activeDoc && h(ProseMirror, { state, dispatchTransaction })
    ])
  ]);
};