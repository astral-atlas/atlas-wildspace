// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { WikiDoc, WikiDocID, GameID, Player } from "@astral-atlas/wildspace-models";
import type { UserID } from "@astral-atlas/sesame-models";
*/

import { emptyRootNode, proseSchema } from "@astral-atlas/wildspace-models";
import { h, useMemo, useRef, useState } from "@lukekaalim/act";
import { EditorState, PluginKey } from "prosemirror-state";
import { collab, receiveTransaction, sendableSteps, getVersion } from "prosemirror-collab";
import { ProseMirror, prosePlugins, useProseMirrorProps, useProseMirrorView, useWikiDocCollab } from "../richText";
import {
  useWikiDocConnection,
} from "../richText/collab";
import { useGameConnection } from "./data";
import styles from './Wiki.module.css';
import { Node } from "prosemirror-model";
import { parse } from 'uuid';
import { Step } from "prosemirror-transform";
import seedrandom from 'seedrandom';
import { createFocusDecorationPlugin } from "../richText";

/*::
export type WikiProps = {
  api: WildspaceClient,
  userId: UserID,
  gameId: GameID,
  docs: $ReadOnlyArray<WikiDoc>,
  players: $ReadOnlyArray<Player>,
};
*/

const defaultEditorState = EditorState.create({
  schema: proseSchema,
  doc: emptyRootNode
})

export const Wiki/*: Component<WikiProps>*/ = ({
  api,
  userId,
  gameId,
  docs,
  players,
}) => {
  const [, wiki, connectionId] = useGameConnection(api, gameId);

  const [activeDoc, setActiveDoc] = useState(null)
  const [refreshTime, setRefreshTime] = useState/*:: <number>*/(() => Date.now());

  const ref = useRef();
  const view = useProseMirrorView(ref, defaultEditorState, null, [activeDoc]);
  const connections = useWikiDocCollab(view, wiki, connectionId, activeDoc, [refreshTime]);

  return h('div', { className: styles.wiki }, [
    h('div', { className: styles.wikiContent }, [
      h('div', { className: styles.wikiControls }, [
        h('select', { onInput: e => setActiveDoc(e.target.value || null) }, [
          docs.map(doc =>
            h('option', { value: doc.id, selected: doc.id === activeDoc }, doc.title)),
          h('option', { value: '', selected: activeDoc === null }, 'None')
        ]),
        h('button', { onClick: () => setRefreshTime(Date.now()) }, 'Reload'),
        h('div', { style: { flex: 1 }}),
        [...connections].map(([id, c]) => {
          const player = players.find(p => p.userId === c.userId);
          if (!player)
            return null;
          
          const connectionHue = seedrandom(id)() * 360;
          const userHue = seedrandom(player.userId)() * 360;

          return h('div', { key: id,  class: styles.wikiConnectionName, style: { 
            backgroundColor: `hsl(${connectionHue}deg, 40%, 90%)`,
            borderColor: `hsl(${userHue}deg, 60%, 75%)`,
          } }, player.name)
        }),
      ]),
      activeDoc && h('div', { ref, className: styles.wikiProseMirrorRoot }),
    ])
  ]);
};