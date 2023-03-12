// @flow strict
import { Object3D } from "three";
import { h, useMemo } from "@lukekaalim/act";
import { TreeGraphColumn, ExpandToggleInput } from "../..";
import styles from './ModelResourceTreeInput.module.css';
import hash from '@sindresorhus/string-hash';

/*::
import type { Component } from "@lukekaalim/act";
import type { ModelResourcePart } from "@astral-atlas/wildspace-models";

export type ModelResourceTreeInputProps = {
  modelObject: Object3D,
  parts: ModelResourcePart[],
  selectedObject?: null | Object3D,
  onSelectChange?: (null | Object3D) => mixed,
};
*/
export const ModelResourceTreeInput/*: Component<ModelResourceTreeInputProps>*/ = ({
  modelObject,
  parts,
  selectedObject,
  onSelectChange = _ => {},
}) => {

  const rootNodes = useMemo(() => {
    const buildNodesFromObject = (object) => {
      return { id: object.id.toString(), children: object.children.map(buildNodesFromObject) }
    }

    return [buildNodesFromObject(modelObject)];
  }, [modelObject])

  const renderNode = ({ depth, expanded, id, onExpandedChange, showExpanded, hidden }) => {
    const object = modelObject.getObjectById(Number.parseInt(id));
    const isSelected = selectedObject === object;
    const style = {
      paddingLeft: `${depth * 3}rem`,
    }
    const onClick = () => {
      onSelectChange(object);
    }
    const nodeParts = parts.filter(p => p.objectUuid === object.uuid);
    return !hidden && h('div', { style, classList: [styles.objectNode, isSelected && styles.selected] }, [
      showExpanded && h(ExpandToggleInput, { expanded, onExpandedChange }),
      h('button', {
        class: styles.objectName,
        onClick,
        style: {
          ['--name-color']: `hsl(${hash(object.name) % 360}deg, 20%, 80%)` } },
          object.name),
      h('span', {
        class: styles.objectTagColumn,
      }, [
        h('span', { class: styles.objectTag, style: { 
          backgroundColor: `hsl(${hash(object.type) % 360}deg, 50%, 50%)` } }, object.type),
      ]),
      nodeParts.map(part =>
        h('span', { class: styles.objectTagColumn }, [
          h('span', { class: styles.objectTag, style: { 
            backgroundColor: `hsl(${hash(part.id) % 360}deg, 50%, 50%)` } }, part.title),
        ])
      ),
    ]);
  }

  return h('div', { class: styles.modelTreeInput },
    h(TreeGraphColumn, { renderNode, rootNodes, selectedNodes: new Set() }));
}