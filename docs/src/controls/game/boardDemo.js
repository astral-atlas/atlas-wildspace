// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */

/*:: import type { Board } from './board'; */

import { BoxHelperGroup, GridHelperGroup, useHelper } from "../helpers";
import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { group, mesh, perspectiveCamera, scene, useAnimationFrame, useRenderLoop, useResizingRenderer, useWebGLRenderer } from "@lukekaalim/act-three";

import {
  Vector3,
  PlaneGeometry,
  Euler,
  LineBasicMaterial,
  MeshBasicMaterial,
  RepeatWrapping,
  TextureLoader,
  PMREMGenerator,
  Color,
  MathUtils,
  BoxGeometry,
} from "three";
import { useLookAt } from "@lukekaalim/act-three/hooks/matrix";

import grid_highlight_basic_texture from '../../assets/grid_highlight_basic_300.png';

import styles from '../index.module.css';
import { raycastManagerContext, useRaycastManager } from "../raycast";
import { useAnimation } from "@lukekaalim/act-curve/animation";
import { calculateSpanProgress, defaultBezierElementOptions, useAnimatedList, useBezierAnimation } from "@lukekaalim/act-curve";
import {
  calculateBezier2DPoint,
  useAnimatedVector2,
  useBezier2DAnimation,
} from "../../pages/layouts";
import { BoardInterface, Encounter } from "./board";
import { useRenderLoopManager } from "../loop";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";

import keelboatModelURL from './keelboat.gltf';
import keelboatTextureURL from './keelboat.jpg';
import waternormalsTextureURL from './waternormals.jpg';
import { useSubscriptionList } from "../subscription";
import { useBoardCameraControl } from "../finalDemo";
import {
  useKeyboardContextValue,
  useKeyboardState,
  useKeyboardTrack,
} from "../keyboard";


const boxGeo = new BoxGeometry(10, 10, 10);

export const BoardDemo/*: Component<>*/ = () => {
  const canvasRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();

  const webgl = useWebGLRenderer(canvasRef, { antialias: true });
  const size = useResizingRenderer(canvasRef, webgl);
  
  useEffect(() => {
    const { current: camera } = cameraRef;
    if (!camera || !size)
      return;
    
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix()
  }, [size])


  const [onLoop, loopContext] = useRenderLoopManager()
  const raycaster = useRaycastManager();
  useEffect(() => {
    const { current: canvas } = canvasRef;
    const { current: scene } = sceneRef;
    const { current: camera } = cameraRef;
    if (!canvas || !scene || !camera || !webgl)
      return;

    const renderVars = {
      delta: 0,
      now: performance.now(),
    }
    const renderConsts = {
      canvas,
      scene,
      camera,
      renderer: webgl
    }
    const onFrame = (now) => {
      renderVars.delta = now - renderVars.now;
      renderVars.now = now;

      onLoop(renderConsts, renderVars);

      id = requestAnimationFrame(onFrame);
    }
    let id = requestAnimationFrame(onFrame);
    return () => {
      cancelAnimationFrame(id);
    }
  }, [webgl]);

  useEffect(() => loopContext.subscribeInput((renderConsts, renderVars) => {
    raycaster.onUpdate(renderConsts.camera)
  }), [])

  useEffect(() => loopContext.subscribeRender((renderConsts) => {
    renderConsts.renderer.render(renderConsts.scene, renderConsts.camera);
  }), [])
  

  const gridRef = useRef();

  const roundToGrid = ([x, y]) => [
    (Math.round((x +5) / 10) * 10) - 5,
    (Math.round((y +5) / 10) * 10) - 5,
  ]
/*
  useAnimation(() => {
    const point = raycaster.lastIntersectionRef.current?.point;
    if (!point)
      return;

    setFocus(prevFocus => {
      const nextFocus = roundToGrid([point.x, point.z]);
      const prev = anims.find(prevAnim => prevAnim.value[0] === nextFocus[0] && nextFocus[1] === prevAnim.value[1])
      if (prev)
        return prev.value;
      if (prevFocus[0] === nextFocus[0] && nextFocus[1] === prevFocus[1])
        return prevFocus;
      return nextFocus;
    });
  }, []);
  */

  const [otherFocus, setOtherFocus] = useState/*:: <[number, number]>*/([0, 0]);
  /*
  useEffect(() => {
    const id = setInterval(() => {
      const now = performance.now();
      const radians = now * 0.0002 * Math.PI;

      const next = roundToGrid([Math.sin(radians) * 40, Math.cos(radians) * 40]);
      setOtherFocus(prev => {
        if (prev[0] === next[0] && prev[1] === next[1])
          return prev;
        return next;
      });
    }, 300);
    return () => {
      clearInterval(id);
    }
  }, [])
  */
  const [visible, setVisible] = useState(false);
  const [focus, setFocus] = useState/*:: <[number, number]>*/([0, 0]);

  const [anims, filter] = useAnimatedList(visible ? [focus, otherFocus] : [otherFocus], [], {
    ...defaultBezierElementOptions, statusDurationMs: 400, statusImpulse: 3 })
  useEffect(() => {
    const now = performance.now();
    filter(anim => calculateSpanProgress(anim.status.span, now) !== 1)
  }, [visible, focus]);
/*
  useEffect(() => {
    const { current: grid } = gridRef;
    if (!grid)
      return;

    const enter = () => {
      setVisible(true)
    };
    const exit = () => {
      setVisible(false)
    }
    const click = (intersection) => {
      setBoxPosition(roundToGrid([intersection.point.x, intersection.point.z]))
    }
    return raycaster.subscribe(grid, { enter, exit, click })
  }, [])
  */

  const onContextMenu = (event) => {
    event.preventDefault();
    const subscribers = auxClickSubscribers.current;
    for (const subscriber of subscribers)
      subscriber(event)
  }

  const canvasProps = {
    ref: canvasRef,
    className: styles.bigDemoCanvas,
    
    onMouseEnter: raycaster.onMouseEnter,
    onMouseMove: raycaster.onMouseMove,
    onMouseExit: raycaster.onMouseExit,
    onClick: raycaster.onClick,
    onContextMenu,
    tabIndex: 0,
  }

  const [plane] = useState(new PlaneGeometry(100, 100));

  const boxRef = useRef();
  const [boxPosition, setBoxPosition] = useState(roundToGrid([0, 0]));
  const boxAnim = useAnimatedVector2(boxPosition, [0, 0], 30);
  useBezier2DAnimation(boxAnim, point => {
    if (boxRef.current)
      boxRef.current.position.set(point.position[0], 5, point.position[1]);
  })
  const groupRef = useRef();

  /*
  useAnimation((now) => {
    const { current: camera } = cameraRef;
    if (!camera)
      return;
    const rotation = now / 1000 * Math.PI * (1/60);

    camera.position.set(Math.cos(rotation) * 90, 50, Math.sin(rotation) * 90);
    camera.lookAt(new Vector3(0, 0, 0));
  })
  */
  //useLookAt(cameraRef, new Vector3(0, 0, 0), []);

  const [keelboatGeometry, setKeelboatGeometry] = useState(null); 
  useEffect(() => {
    const loader = new GLTFLoader();
    const a = loader.load(keelboatModelURL, (gltf) => {
      const keelboatMesh = gltf.scene.children[0];
      keelboatMesh.geometry.scale(8, 8, 8)
      setKeelboatGeometry(keelboatMesh.geometry);
    })
  }, [])
  const [keelboatMaterial, setKeelboatMaterial] = useState(null); 
  useEffect(() => {
    const run = async () => {
      const keelboatTexture = await new TextureLoader().loadAsync(keelboatTextureURL);
      const keelboatMaterial = new MeshBasicMaterial({ map: keelboatTexture });
      setKeelboatMaterial(keelboatMaterial)
    };
    run();
  }, []);
  const [water, setWater] = useState(null);
  useEffect(() => {
    if (!webgl)
      return;

    const waterGeometry = new PlaneGeometry( 10000, 10000 );
    const sky = new Sky();
    sky.scale.setScalar( 10000 );

    const skyUniforms = sky.material.uniforms;

    const sun = new Vector3();

    skyUniforms[ 'turbidity' ].value = 10;
    skyUniforms[ 'rayleigh' ].value = 2;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;
    const water = (new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new TextureLoader().load(waternormalsTextureURL, function ( texture ) {
          texture.wrapS = texture.wrapT = RepeatWrapping;
        } ),
        sunDirection: new Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
      }
    ));
    setWater(water);
    water.position.y -= 1;
    water.rotation.x = - Math.PI / 2;
    sceneRef.current.add(water);
    sceneRef.current.add( sky );
    const parameters = {
      elevation: 2,
      azimuth: 180
    };

    const pmremGenerator = new PMREMGenerator( webgl );

    function updateSun() {

      const phi = MathUtils.degToRad( 90 - parameters.elevation );
      const theta = MathUtils.degToRad( parameters.azimuth );

      sun.setFromSphericalCoords( 1, phi, theta );

      sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
      water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

      sceneRef.current.environment = pmremGenerator.fromScene( sky ).texture;
    }
    updateSun();
  }, [webgl]);
  useAnimation(now => {
    if (water)
      water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
  }, [water])

  const boatRef = useRef();
  useAnimation((now) => {
    const { current: boat } = boatRef;
    if (!boat)
      return;

    boat.position.y = Math.sin(now * 1.3 / 1000) + 5;
    boat.rotation.z = (Math.sin((now * 3.4) / 1000) +  Math.sin(now / 1000)) / 32;
  }, [keelboatGeometry, keelboatMaterial])

  const [subscribeAuxClick, auxClickSubscribers] = useSubscriptionList();
  

  const coolPiece = {
    pieceId: 'cool',
    area: { type: 'box', origin: [0, 1, 0],  height: 1, width: 1, depth: 1 }
  }
  const hotPiece = {
    pieceId: 'hot',
    area: { type: 'box', origin: [4, 4, 0],  height: 1, width: 1, depth: 1 }
  }

  const pieces = [
    coolPiece,
    hotPiece,
  ];

  const [board, setBoard] = useState/*:: <Board>*/({ id: 'a', width: 10, height: 10, pieces });

  const [readInputs, onInputChange] = useKeyboardTrack();
  const [keyRef, events] = useKeyboardState(null, onInputChange);
  const keyboardContext = useKeyboardContextValue(canvasRef);
  useEffect(() => {
    const clearDown = keyboardContext.subscribeDown(events.down);
    const clearUp = keyboardContext.subscribeUp(events.up);
    return () => (clearDown(), clearUp());
  }, [])
  useBoardCameraControl(cameraRef, readInputs, 60);

  const movePiece = (_, pieceId, position) => {
    if (!_ || !pieceId || !position)
      return;
    setBoard(board => ({
      ...board,
      pieces: board.pieces.map(p => p.pieceId === pieceId ? ({
        ...p,
        area: { ...p.area, origin: position }
      }) : p)
    }))
  }

  return [
    h('canvas', canvasProps),
    h(scene, { ref: sceneRef }, [
      h(perspectiveCamera, { ref: cameraRef, fov: 50 }),
      //h(mesh, { visible: false, geometry: plane, ref: gridRef, rotation: new Euler(Math.PI * 1.5, 0, 0) }),
      /*
      h(group, { ref: groupRef }, [
        keelboatGeometry && keelboatMaterial && h(mesh, { ref: boatRef, geometry: keelboatGeometry, material: keelboatMaterial }, [
          h(GridHelperGroup, { size: 100, interval: 10 }),
          h(BoardInterface, { raycaster, board: { width: 10, height: 10, pieces, }}),
        ]),
      ])
      */
      h(raycastManagerContext.Provider, { value: raycaster }, [
        h(Encounter, { board, subscribeAuxClick, movePiece })
      ]),
      //h(mesh, { geometry: boxGeo, ref: boxRef }),
    
      //anims.map(anim => h(GridSquareHighlighter, { status: anim.status, position: new Vector3(anim.value[0], 0, anim.value[1]) })),
    ])
  ];
}

const gridHighlightGeometry = new PlaneGeometry(30, 30, 1, 1).rotateX(Math.PI*1.5);
const map = new TextureLoader().load(grid_highlight_basic_texture);

const GridSquareHighlighter = ({ position, status }) => {
  const ref = useRef();
  const [gridMaterial] = useState(new MeshBasicMaterial({ map, transparent: true }));

  useBezierAnimation(status, point => {
    const { current: mesh } = ref;
    if (!mesh)
      return;
    
    gridMaterial.opacity = (1 - Math.abs(point.position))
    mesh.position.setY(((1 - Math.abs(point.position)) * 10) - 10)
    mesh.visible = point.position < 1
  });
  useAnimation((now) => {
    const { current: mesh } = ref;
    if (!mesh)
      return;
    gridMaterial.color.setHSL((now * 0.00005) % 255, 1, 0.8);
    mesh.rotation.y = now * Math.PI * 0.00025;
  })

  return [
    h(mesh, { ref, geometry: gridHighlightGeometry, material: gridMaterial, position })
  ]
}
