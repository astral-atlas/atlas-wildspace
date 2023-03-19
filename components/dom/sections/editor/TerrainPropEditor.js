// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { MiniTheaterRenderResources } from "../../../miniTheater/useMiniTheaterResources";
import type { TerrainProp, Tag, TagID } from "@astral-atlas/wildspace-models";
*/
import { h, useMemo, useState } from '@lukekaalim/act';
import { scene } from "@lukekaalim/act-three";
import { ExpandToggleInput, PreviewSidebarLayout, TagBoxTreeColumn } from '../../blocks'
import { RenderCanvas } from "../../../three/RenderCanvas";
import { TreeGraphColumn } from "../../blocks/layout/TreeGraphColumn";
import stringHash from '@sindresorhus/string-hash';

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
  const [selectedNodeId, setSelectedNodeId] = useState(null)

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

  return h(PreviewSidebarLayout, {
    bottomPane: '',
    topPane: h(TagBoxTreeColumn, {
      rootNodes,
      nodeDetails: new Map(terrainProp.nodes.map(n => ([n.meta.id, {
        title: n.meta.name || 'Untitled Node',
        color: `hsl(${stringHash(n.meta.id) % 360}deg, 40%, 80%)`,
        id: n.meta.id,
        tags: [{ title: n.type, color: `hsl(${stringHash(n.type) % 360}deg, 60%, 40%)` }],
      }]))),
      selectedNodeIds: [selectedNodeId].filter(Boolean),
      onEvent: event => {
        switch (event.type) {
          case 'select':
            return setSelectedNodeId(event.nodeId)
        }
      }
    }),
    preview: h(RenderCanvas, { },
      h(scene)),
  });
};