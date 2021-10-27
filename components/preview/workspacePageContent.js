// @flow strict
/*:: import type { Component, Context, SetValue, ElementNode } from '@lukekaalim/act'; */
import { h, createContext, useContext, useState } from "@lukekaalim/act";

import previewStyles from './previewStyles.module.css';

export const ComponentPreview = () => {

};


/*::
export type WorkspacePageContentProps<T> = {
  defaultProps: T,
  renderTools: ({ props: T, setProps: SetValue<T> }) => ElementNode,
  renderBench: ({ props: T }) => ElementNode,
};
*/
/*::
export type WorkspaceContextValue = { props: any, setProps: SetValue<any> };
*/
const workspaceContext/*: Context<?WorkspaceContextValue>*/ = createContext();
export const useWorkspaceContext = ()/*: WorkspaceContextValue*/ => {
  const workspace = useContext(workspaceContext);
  if (!workspace)
    throw new Error();
  return workspace;
};

export const WorkspacePageContent/*: Component<WorkspacePageContentProps<any>>*/ = ({ defaultProps, renderTools, renderBench }) => {
  const [props, setProps] = useState(defaultProps);

  return h('div', { className: previewStyles.workspace }, [
    h(workspaceContext.Provider, { value: { props, setProps } }, [
      h('div', { className: previewStyles.bench }, h('span', { className: previewStyles.workspaceContainer }, renderBench({ props }))),
      h('div', { className: previewStyles.tools }, h('span', { className: previewStyles.workspaceContainer }, renderTools({ props, setProps }))),
    ]),
  ])
};

export const renderWorkspacePageContent = /*:: <T>*/(p/*: WorkspacePageContentProps<T>*/)/*: ElementNode*/ => {
  return h(WorkspacePageContent, p);
};
