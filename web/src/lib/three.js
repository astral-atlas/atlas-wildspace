// @flow strict
/*:: import type { Node, StateID, Commit, CommitDiff, Graph, Props, TypedComponent } from '@lukekaalim/act'; */
import { createGraph, createNode, getStateId } from '@lukekaalim/act';
import * as three from 'three';

const geometry = new three.BoxGeometry();
const material = new three.MeshBasicMaterial({ color: 0x00ff00 });

const findNamedDescendantNodes = (
  fragments/*: Map<StateID, Commit[]>*/,
  commit/*: Commit*/,
  depth/*: null | number*/ = null
)/*: Commit[]*/ => {
  if (depth != null && depth <= 0)
    return [];
  
  return commit.childCommits.map(child => {
    if (typeof child.node.type === 'function')
      return fragments.get(getStateId(child.statePath)) || [];

    return [
      child,
      ...findNamedDescendantNodes(fragments, child, depth === null ? null : depth - 1),
    ];
  }).flat()
};

const createFragmentHandler = (fragments/*: Map<StateID, Commit[]> */) => {
  const create = (commit/*: Commit*/) => {
    const nodes = findNamedDescendantNodes(fragments, commit, 1);
    fragments.set(getStateId(commit.statePath), nodes);
  };
  const update = (commit/*: Commit*/) => {
    const nodes = findNamedDescendantNodes(fragments, commit);
    fragments.set(getStateId(commit.statePath), nodes);
  };
  const remove = (commit/*: Commit*/) => {
    fragments.delete(getStateId(commit.statePath));
  };

  return {
    create,
    update,
    remove,
  };
};

const getChildMeshes = (
  fragments/*: Map<StateID, Commit[]> */,
  meshes/*: Map<StateID, three.Mesh>*/,
  commit/*: Commit*/
)/*: ([StateID, three.Mesh])[]*/ => {
  const commits = findNamedDescendantNodes(fragments, commit, 1);

  const childMeshes = commits
    .filter(commit => commit.node.type === 'mesh')
    .map(commit => getStateId(commit.statePath))
    .map(id => {
      const mesh = meshes.get(id);
      if (!mesh)
        return null;
      return [id, mesh];
    })
    .filter(Boolean);
  return childMeshes;
};

const createMeshCommitHandler = (fragments/*: Map<StateID, Commit[]> */, meshes/*: Map<StateID, three.Mesh>*/) => {
  const create = (commit/*: Commit*/, diff) => {
    // create mesh
    const mesh = new three.Mesh(geometry, material);
    mesh.position.copy(commit.node.props.position);
    meshes.set(getStateId(commit.statePath), mesh);

    const childMeshes = getChildMeshes(fragments, meshes, commit);
    
    for (const [id, childMesh] of childMeshes)
      mesh.add(childMesh);
  };
  const update = (commit/*: Commit*/, diff/*: CommitDiff*/) => {
    const mesh = meshes.get(getStateId(commit.statePath));
    if (!mesh)
      throw new Error();
    
    mesh.position.copy(commit.node.props.position)

    const removedMeshes = diff.removed.map(([commit]) => getChildMeshes(fragments, meshes, commit));
    const addedMeshes = diff.created.map(([commit]) => getChildMeshes(fragments, meshes, commit));

    for (const [id, childMesh] of removedMeshes) {
      mesh.remove(childMesh)
      meshes.delete(id);
    }
    for (const [childMesh] of addedMeshes)
      mesh.add(childMesh);
  };
  const remove = (commit) => {
    const mesh = meshes.get(getStateId(commit.statePath));
    if (!mesh)
      throw new Error();
    // Don't remove the mesh from the meshes map, since
    // the parent of this mesh will do that
    mesh.clear();
    mesh.visible = false;
  };

  return {
    create,
    update,
    remove,
  };
};

const createRootCommitHandler = (fragments/*: Map<StateID, Commit[]> */, scene/*: three.Scene*/, meshes/*: Map<StateID, three.Mesh>*/) => {
  const create = (commit/*: Commit*/) => {
    const childObjects = findNamedDescendantNodes(fragments, commit, 1);
    const childMeshes = childObjects
      .map(commit => meshes.get(getStateId(commit.statePath)))
      .filter(Boolean);
    
    scene.add(...childMeshes);
  };
  const update = (commit, diff) => {
    const removedMeshes = diff.removed.map(([commit]) => getChildMeshes(fragments, meshes, commit)).flat()
    const addedMeshes = diff.created.map(([commit]) => getChildMeshes(fragments, meshes, commit)).flat()

    for (const [id, mesh] of removedMeshes) {
      scene.remove(mesh)
      meshes.delete(id);
    }
    for (const [id, mesh] of addedMeshes)
      scene.add(mesh);
  };
  const remove = () => {
    
  };

  return {
    create,
    update,
    remove,
  };
}

const createThreeGraph = (canvas/*: HTMLCanvasElement*/, rootNode/*: Node*/)/*: Graph*/ => {
  // State tracking
  const fragments/*: Map<StateID, Commit[]> */ = new Map();
  const meshes/*: Map<StateID, three.Mesh>*/ = new Map();
  const frameUpdaters/*: Map<StateID, () => mixed>*/ = new Map();
  // three setup
  const scene = new three.Scene();
  const camera = new three.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  const renderer = new three.WebGLRenderer({ canvas });

  camera.position.set(0, 0, 5);

  const commitHandlers = {
    ['component']: createFragmentHandler(fragments),
    ['mesh']: createMeshCommitHandler(fragments, meshes),
    ['root']: createRootCommitHandler(fragments, scene, meshes),
  };
  
  // graph setup
  const graph = createGraph(rootNode, requestAnimationFrame);
  const rootCommit = graph.getRoot();

  const render = () => {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    for (const [, updater] of frameUpdaters)
      updater();
  };

  const getCommitHandler = (commit/*: Commit*/) => {
    if (getStateId(commit.statePath) === getStateId(rootCommit.statePath))
      return commitHandlers['root'];
    if (typeof commit.node.type === 'function')
      return commitHandlers['component'];
    switch (commit.node.type) {
      case 'mesh':
        return commitHandlers['mesh'];
      default:
        throw new Error(`Unknown node type ${commit.node.type}`);
    }
  }

  const onChange = (type, commit, diff) => {
    const handler = getCommitHandler(commit);
    switch (type) {
      case 'created':
        return handler.create(commit, diff);
      case 'updated':
        return handler.update(commit, diff);
      case 'removed':
        return handler.remove(commit, diff);
      default:
        throw new Error(`Unknown commit event type`);
    }
  };

  const onGraphEvent = (changes) => {
    changes.map(change => onChange(change.type, change.commit, change.diff));
  };

  graph.listen(onGraphEvent);
  render();

  return graph;
};


/*:: type CubeProps = { position?: three.Vector3 }; */
const Cube = ({ position = new three.Vector3(0, 0, 0) }/*: CubeProps*/, children/*: Node[]*/)/*: Node[]*/ => {
  return [createNode('mesh', { position }, children)]
};

export {
  createThreeGraph,
  Cube,
  createNode as n,
}