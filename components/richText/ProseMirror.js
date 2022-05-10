// @flow strict
/*::
import type { Component, SetValue } from "@lukekaalim/act";
import type {  } from "@astral-atlas/wildspace-models";
import type { Plugin } from 'prosemirror-state'; 
*/
import { EditorView } from 'prosemirror-view'; 
import { EditorState } from 'prosemirror-state'; 
import { exampleSetup } from 'prosemirror-example-setup'; 
import { h, useEffect, useMemo, useRef, useState } from '@lukekaalim/act';
import { proseSchema as schema } from "@astral-atlas/wildspace-models";

import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-menu/style/menu.css';
import 'prosemirror-example-setup/style/style.css';

export const prosePlugins/*: Plugin<any>[]*/ = [
  ...exampleSetup({ schema })
];

export const useProseMirrorEditorState = (
  initialState/*: EditorState<any, any> | () => EditorState<any, any>*/ = EditorState.create({ schema, plugins: prosePlugins })
)/*: [EditorState<any, any>, any => void, SetValue<EditorState<any, any>>]*/ => {
  const [state, setState] = useState/*:: <EditorState<any, any>>*/(initialState);

  const dispatchTransaction = useMemo(() => (transaction) => {
    setState(prevState => {
      return prevState.apply(transaction)
    });
  }, [])

  return useMemo(() => [state, dispatchTransaction, setState], [state]);
}

/*::
export type ProseMirrorProps = {
  state: EditorState<any, any>,
  dispatchTransaction: (any) => mixed,
  decorations?: (state: EditorState<any, any>) => any,
}
*/

export const ProseMirror/*: Component<ProseMirrorProps>*/ = ({
  state,
  dispatchTransaction,
  decorations,
}) => {
  const ref = useRef/*:: <?HTMLElement>*/();
  const [view, setView] = useState();

  useEffect(() => {
    const { current: container } = ref;
    if (!container)
      return;
    const view = new EditorView(container, { state, dispatchTransaction });
    setView(view);
    return () => view.destroy();
  }, [])
  useEffect(() => {
    if (!view)
      return;
    view.updateState(state)
  }, [view, state]);
  useEffect(() => {
    if (!view)
      return;
    view.setProps({
      dispatchTransaction(tr) {
        view.updateState(view.state.apply(tr));
        dispatchTransaction(tr);
      },
      decorations
    })
  }, [view, dispatchTransaction, decorations]);

  return h('div', { ref })
}