// @flow strict

/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { Scene } from "three";
import type { RenderLoopConstants } from "../three/useLoopController";
*/

import { h, useEffect, useRef } from "@lukekaalim/act";
import { directionalLight, group, useDisposable } from "@lukekaalim/act-three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";

import { Vector3, MathUtils, PlaneGeometry, TextureLoader, RepeatWrapping, PMREMGenerator } from "three";
import waterNormalURL from './waternormals.jpg'

export const LosersFollyScene/*: Component<{ render: RenderLoopConstants }>*/ = ({ render }) => {
  const ref = useRef();

  const phi = MathUtils.degToRad( 90 - 2 );
  const theta = MathUtils.degToRad( 180 );
  const sun = new Vector3();
  sun.setFromSphericalCoords( 1, phi, theta );

  useEffect(() => {
    const { current: root } = ref;
    if (!root)
      return;
    const sky = new Sky();
    const skyUniforms = sky.material.uniforms;

    skyUniforms[ 'turbidity' ].value = 10;
    skyUniforms[ 'rayleigh' ].value = 2;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    root.add(sky);
    const pmremGenerator = new PMREMGenerator( render.renderer );
    render.scene.environment = pmremGenerator.fromScene( sky ).texture;
    console.log(render.scene.environment)
    return () => root.remove(sky);
  }, [render])

  const waterGeometry = useDisposable(() => new PlaneGeometry(10000, 10000), [])
  const waterNormals = useDisposable(() => {
    return new TextureLoader().load(waterNormalURL, function ( texture ) {
      texture.wrapS = texture.wrapT = RepeatWrapping;
    } );
  }, [])
  useEffect(() => {
    const { current: root } = ref;
    if (!root)
      return;
    const options = {
      geometry: waterGeometry,
      waterNormals,
      textureHeight: 512,
      textureWidth: 512,
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
    }
    const water = new Water(waterGeometry, options);
    root.add(water);
    water.position.set(0, -10, 0);
    water.rotation.x = - Math.PI / 2;
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();
    water.onBeforeRender = () => {
      water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
    };
    return () => root.remove(water);
  }, []);

  return [
    h(group, { ref }),
    h(directionalLight, { position: new Vector3(-1, 1, 1) })
  ];
};
