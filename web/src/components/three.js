// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { Node as ANode } from '@lukekaalim/act'; */
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { createThreeGraph } from '../lib/three';

/*::
type ThreeCanvasProps = {
  rootNode: ANode
};
*/
const ThreeCanvas = ({ rootNode }/*: ThreeCanvasProps*/)/*: Node*/ => {
  const [graph, setGraph] = useState(null);

  const ref = (canvas) => {
    if (!canvas)
      return;
    if (graph) {
      if (graph.getRoot().node.id !== rootNode.id) {
        graph.updateRoot(rootNode);
      }
    } else {
      setGraph(createThreeGraph(canvas, rootNode));
    }
  };
  return h('canvas', { ref, width: 1600/2, height: 900/2 });
};

export {
  ThreeCanvas
};