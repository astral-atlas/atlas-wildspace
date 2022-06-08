// @flow strict
/*::
import type { Particle2D } from "./particle2d";
import type { Box2 } from "three";
*/


import { simulateParticle2D } from "./particle2d";
import { useMemo, useRef, useState } from "@lukekaalim/act"

import { Vector2 } from "three";

const zero = new Vector2(0, 0)

export const useParticle2dSimulation = (
  bounds/*: ?Box2*/ = null,
  dragCoefficent/*: number*/ = 1/10,
  velocityMagnitudeMax/*: number*/ = 1,
  initialPosition/*: ?Vector2*/ = null,
  initialVelocity/*: ?Vector2*/ = null,
)/*: [Particle2D, (accelerationPerMs: Vector2, deltaTimeMs: number) => void]*/ => {
  const [particle] = useState/*:: <Particle2D>*/({
    position: initialPosition || new Vector2(0, 0),
    velocityPerMs: initialVelocity || new Vector2(0, 0)
  });

  const settings = {
    bounds,
    dragCoefficent,
    velocityMagnitudeMax,
  };

  const simulate = (accelerationPerMs, deltaTimeMs) => {
    simulateParticle2D(particle, settings, accelerationPerMs, deltaTimeMs);
  }

  return useMemo(
    () => [particle, simulate],
    [dragCoefficent, velocityMagnitudeMax]
  );
}
