// @flow strict
/*::
import type { WildspaceClient, WikiConnection } from "@astral-atlas/wildspace-client2";
import type { GameData } from "../../game/data";
import type { Component } from '@lukekaalim/act';
*/

import { h, useEffect, useMemo, useState } from "@lukekaalim/act";
import { collab, receiveTransaction, sendableSteps } from "prosemirror-collab"

import { AssetLibraryWindow } from "./window";
import { AssetGrid, AssetGridItem } from "../grid";
import { useSelection } from "../../editor/selection";
import {
  EditorCheckboxInput,
  EditorForm,
  EditorFormSubmit,
  EditorTextInput,
} from "../../editor/form";
import { useGameConnection } from "../../game/data";
import {
  ProseMirror,
  prosePlugins,
  useProseMirrorEditorState,
} from "../../richText/ProseMirror";
import { Node } from "prosemirror-model";
import { EditorState, Plugin } from "prosemirror-state";
import { proseSchema } from "@astral-atlas/wildspace-models";
import { Step } from "prosemirror-transform";


/*::
export type WikiLibraryProps = {
  gameData: GameData,
  client: WildspaceClient
};
*/

export const WikiLibrary/*: Component<WikiLibraryProps>*/ = ({
  gameData,
  client
}) => {
  const [selection, select] = useSelection()

  const [times, wiki] = useGameConnection(client, gameData.game.id);

  if (!wiki)
    return 'Loading';

  const selected = gameData.wikiDocs.find(d => d.id === selection[0])

  const update = async (input) => {
    if (!selected)
      return;
    
    await client.game.wiki.update(gameData.game.id, selected.id, input);
  }
  const create = async () => {
    await client.game.wiki.create(gameData.game.id, { title: 'Untitled Document' });
  }

  return h(AssetLibraryWindow, {
    editor: selected && h(EditorForm, {}, [
      h(EditorTextInput, { label: 'ID', disabled: true, text: selected.id }),
      h(EditorTextInput, { label: 'Title', text: selected.title, onTextChange: title => update({ title }) }),
    ]),
    content: [
      h(EditorForm, { onEditorSubmit: create }, [
        h(EditorFormSubmit, { label: 'Create New Document' }),
      ]),
      h('hr'),
      h(AssetGrid, { }, gameData.wikiDocs.map(wikiDoc =>
        h(AssetGridItem, { id: wikiDoc.id, select, selected: !!selection.find(id => id === wikiDoc.id) }, wikiDoc.title))),
      h('hr'),
      !!selected && h(WikiDocEditor, { doc: selected, wiki, userId: gameData.userId }),
    ]
  })
}


const focusDecorationPlugin = (client, userId) => {
  const plugin = new Plugin({
    state: {
      init() {
        return { focus: [], to: 0, from: 0 }
      },
      apply(tr, pluginState, prev) {
        const from = tr.selection.from;
        const to = tr.selection.to;
        if (pluginState.from !== from || pluginState.to !== to) {
          client.focus(from, to);
        }
        return { focus: tr.getMeta(plugin) || pluginState.focus, to, from }
      }
    },
    view: (view) => {
      const elements = new Set();
      return {
        update(view, prevState) {
          for (const element of elements) {
            const parent = element.parentElement;
            if (parent)
              parent.removeChild(element);
          }
          elements.clear();
          
          const { focus: focusList } = plugin.getState(view.state);
          const validFocusList = focusList.filter(focus => focus.userId !== userId);
          for (const focus of validFocusList) {
            const { node: startNode, offset: startOffset } = view.domAtPos(focus.selection.from, +1)
            const { node: endNode, offset: endOffset } = view.domAtPos(focus.selection.to, -1)
            const range = document.createRange();
  
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
  
  
            const rects = range.getClientRects();
            if (!document.body)
              return;
  
            const viewRect = document.body.getBoundingClientRect();
            for (const rect of rects) {
              const element = document.createElement('div');
  
              const top = rect.top - viewRect.top;
              const left = rect.left - viewRect.left;
  
              element.style.position = 'absolute';
              element.style.top = `${top}px`;
              element.style.left = `${left}px`;
  
              element.style.width = `${rect.width}px`;
              element.style.height = `${rect.height}px`;
              element.style.border = `2px solid blue`;
  
              element.style.backgroundColor = `red`;
              element.style.opacity = `0.5`;
              element.style.pointerEvents = 'none';
              document.body.appendChild(element);
              elements.add(element)
            }
          }
        },
        destroy() {
          for (const element of elements) {
            const parent = element.parentElement;
            if (parent)
              parent.removeChild(element);
          }
          elements.clear();

          if (view.hasFocus())
            return;
        }
      }
    }
  });
  return plugin;
};

const WikiDocEditor = ({ doc, wiki, userId }) => {
  const [client, setClient] = useState/*:: <?WikiConnection>*/()

  const [state, setState] = useState/*:: <EditorState<any, any>>*/(EditorState.create({ schema: proseSchema, plugins: prosePlugins }));

  useEffect(() => {
    const client = wiki.connect(doc.id,
      doc => {
        setState(EditorState.create({
          schema: proseSchema,
          doc: Node.fromJSON(proseSchema, doc.rootNode),
          plugins: [
            ...prosePlugins,
            focusDecoration,
            collab({ version: doc.version })
          ],
        }))
      },
      update => {
        setState(state => {
          const transaction = receiveTransaction(state, update.steps.map(s => Step.fromJSON(proseSchema, s)), update.steps.map(s => update.clientId))
          return state.apply(transaction);
        })
      }, focus => {
        setState(state => {
          const transaction = state.tr;
          transaction.setMeta(focusDecoration, focus);
          return state.apply(transaction)
        })
      });
    const focusDecoration = focusDecorationPlugin(client, userId);
    setClient(client);
    return () => {
      client.disconnect();
    }
  }, [doc.id])

  if (!client)
    return null;

  const dispatchTransaction = useMemo(() => (transaction) => {
    setState(prevState => {
      const nextState = prevState.apply(transaction);
      const sendable = sendableSteps(nextState);
      if (sendable)
        client.update(sendable.steps, sendable.clientID);
      return nextState;
    })
  }, [client]);

  return [
    h(ProseMirror, { state, dispatchTransaction })
  ]
}