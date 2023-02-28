// @flow strict
import { Object3D } from "three";
import { h, useMemo } from "@lukekaalim/act";
import { TreeGraphColumn, ExpandToggleInput } from "..";
import styles from './ModelResourceTreeInput.module.css';
import hash from '@sindresorhus/string-hash';

/*::
import type { Component } from "@lukekaalim/act";

export type ModelResourceTreeInputProps = {
  modelObject: Object3D,
  selectedObject?: null | Object3D,
  onSelectChange?: (null | Object3D) => mixed,
};
*/
export const ModelResourceTreeInput/*: Component<ModelResourceTreeInputProps>*/ = ({
  modelObject,
  selectedObject,
  onSelectChange = _ => {},
}) => {

  const rootNodes = useMemo(() => {
    const buildNodesFromObject = (object) => {
      return { id: object.id.toString(), children: object.children.map(buildNodesFromObject) }
    }

    return [buildNodesFromObject(modelObject)];
  }, [modelObject])

  const renderNode = ({ depth, expanded, id, onExpandedChange, showExpanded }) => {
    const object = modelObject.getObjectById(Number.parseInt(id));
    const isSelected = selectedObject === object;
    const style = {
      paddingLeft: `${depth * 3}rem`,
    }
    const onClick = () => {
      onSelectChange(object);
    }
    return h('div', { style, classList: [styles.objectNode, isSelected && styles.selected] }, [
      showExpanded && h(ExpandToggleInput, { expanded, onExpandedChange }),
      h('button', {
        class: styles.objectName,
        onClick,
        style: {
          ['--name-color']: `hsl(${hash(object.name) % 360}deg, 20%, 80%)` } },
          object.name),
      h('span', {
        class: styles.objectTagColumn,
      },
          h('span', { class: styles.objectTag, style: { 
            backgroundColor: `hsl(${hash(object.type) % 360}deg, 50%, 50%)` } }, object.type))
    ]);
  }

  return h('div', { class: styles.modelTreeInput },
    h(TreeGraphColumn, { renderNode, rootNodes, selectedNodes: new Set() }));
}