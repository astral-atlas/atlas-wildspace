// @flow strict
/*::

*/

import { useEffect } from '@lukekaalim/act';
import { Vector3, MathUtils } from "three";
import { Sky } from 'three/examples/jsm/objects/Sky.js';

export const useSky = (elevation/*: number*/ = 2, azimuth/*: number*/ = 180)/*: Sky*/ => {
  const sky = new Sky();

  useEffect(() => {
    sky.material.uniforms[ 'turbidity' ].value = 10;
    sky.material.uniforms[ 'rayleigh' ].value = 3;
    sky.material.uniforms[ 'mieCoefficient' ].value = 0.005;
    sky.material.uniforms[ 'mieDirectionalG' ].value = 0.7;
    const sun = new Vector3(0, 0, 0);
    const phi = MathUtils.degToRad( 90 - elevation );
    const theta = MathUtils.degToRad( azimuth );
    sun.setFromSphericalCoords( 1, phi, theta );

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
  }, [elevation, azimuth])

  
  return sky;
}