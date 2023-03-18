// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { MiniTheaterRenderResources } from "../../../miniTheater/useMiniTheaterResources";
import type { TerrainProp, Tag, TagID } from "@astral-atlas/wildspace-models";
*/
import { h, useMemo } from '@lukekaalim/act';
import { scene } from "@lukekaalim/act-three";
import { ExpandToggleInput, PreviewSidebarLayout } from '../../blocks'
import { RenderCanvas } from "../../../three/RenderCanvas";
import { TreeGraphColumn } from "../../blocks/layout/TreeGraphColumn";

/*::
export type TerrainPropEditor2Props = {
  resources: MiniTheaterRenderResources,
  tags: $ReadOnlyArray<Tag>,
  terrainProp: TerrainProp,

  onEvent?: (event:
    | { type: 'update-prop', terrainProp: TerrainProp }  
  ) => mixed
};
*/

export const TerrainPropEditor2/*: Component<TerrainPropEditor2Props>*/ = ({
  resources,
  terrainProp,
  tags,
  onEvent = _ => {},
}) => {
  const nodeMap = new Map(terrainProp.nodes.map(n => [n.meta.id, n]));
  const getNodes = (ids) => {
    return ids
      .map(id => nodeMap.get(id))
      .filter(Boolean)
      .map(n => {
        switch (n.type) {
          case 'transform':
            return { id: n.meta.id, children: getNodes(n.children) };
          default:
            return { id: n.meta.id, children: [] }
        }
      });
  }
  const rootNodes = getNodes(terrainProp.rootNodes);

  const renderNode = useMemo(() => {
    return ({ depth, expanded, hidden, id, showExpanded, onExpandedChange }) => {
      return !hidden && h('div', { style: { marginLeft: `${depth * 14}px`, display: 'flex' } }, [
        showExpanded && h(ExpandToggleInput, { expanded, onExpandedChange }),
        h('pre', { style: { margin: 0, display: 'inline' }}, id)
      ]);
    }
  }, [])

  return h(PreviewSidebarLayout, {
    bottomPane: '',
    topPane: h(TreeGraphColumn, {
      renderNode,
      rootNodes,
      selectedNodes: new Set(),
    }),
    preview: h(RenderCanvas, { },
      h(scene)),
  });
};