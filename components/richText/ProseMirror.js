// @flow strict
/*::
import type { Component, SetValue, Ref } from "@lukekaalim/act";
import type {  } from "@astral-atlas/wildspace-models";
import type { Plugin, Transaction } from "prosemirror-state"; 
*/
import { EditorView } from 'prosemirror-view'; 
import { EditorState } from 'prosemirror-state'; 
import { exampleSetup } from 'prosemirror-example-setup'; 
import { h, useEffect, useMemo, useRef, useState } from '@lukekaalim/act';
import { proseSchema as schema } from "@astral-atlas/wildspace-models";

import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-menu/style/menu.css';
import 'prosemirror-example-setup/style/style.css';

export const prosePlugins/*: Plugin<any, any>[]*/ = [
  ...exampleSetup({ schema, floatingMenu: false })
];

export const useProseMirrorEditorState = (
  initialState/*: EditorState<any, any> | () => EditorState<any, any>*/ = EditorState.create({ schema, plugins: prosePlugins })
)/*: [EditorState<any, any>, any => void, SetValue<EditorState<any, any>>]*/ => {
  const [state, setState] = useState/*:: <EditorState<any, any>>*/(initialState);

  const dispatchTransaction = useMemo(() => (transaction) => {
    setState(prevState => {
      console.log(`Applying state}`);
      return prevState.apply(transaction)
    });
  }, [])

  return useMemo(() => [state, dispatchTransaction, setState], [state]);
}

export const useProseMirrorView = (
  ref/*: Ref<?HTMLElement>*/,
  initialState/*: EditorState<any, any>*/,
  editorOptions/*: ?{ editable?: () => boolean }*/ = {},
  deps/*: mixed[]*/ = [],
)/*: ?EditorView*/ => {
  const [view, setView] = useState/*:: <?EditorView>*/()
  useEffect(() => {
    const { current: container } = ref;
    if (!container)
      return;
    const view = new EditorView(container, { ...editorOptions, state: initialState });
    setView(view);
    return () => view.destroy();
  }, deps)

  return view && (view.isDestroyed ? null : view);
}
export const useProseMirrorProps = (
  view/*: ?EditorView*/,
  props/*: {
    dispatchTransaction?: Transaction => mixed,
  }*/ = {}, 
  deps/*: mixed[]*/ = []
) => {
  useEffect(() => {
    if (!view)
      return;
    view.setProps(props);
  }, [view, ...deps])
};

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

  return h('div', { ref, style: { flex: 1 } })
}