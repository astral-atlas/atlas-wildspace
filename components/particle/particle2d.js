// @flow strict
import { Box2, Vector2 } from "three";

/*::
export type Particle2D = {
  position: Vector2,
  velocityPerMs: Vector2
};
export type ParticleSettings = {
  dragCoefficent?: number,
  velocityMagnitudeMax?: number,
  bounds?: ?Box2,
};
*/

export const simulateParticle2D = (
  particle/*: Particle2D*/,
  { velocityMagnitudeMax = 1, dragCoefficent = 0.1, bounds }/*: ParticleSettings*/,
  accelerationPerMs/*: Vector2*/,
  durationMs/*: number*/,
)/*: void*/ => {
  const decay = Math.pow(dragCoefficent, durationMs / 1000);
  const acceleration = accelerationPerMs
    .clone()
    .multiplyScalar(durationMs);

  particle.velocityPerMs
    .multiplyScalar(decay)
    .add(acceleration)
    .clampLength(0, velocityMagnitudeMax);

  const velocity = particle.velocityPerMs
    .clone()
    .multiplyScalar(durationMs);
    
  particle.position
    .add(velocity)

  if (bounds)
    bounds.clampPoint(particle.position, particle.position);
}

export const clampParticlePosition = (
  particle/*: Particle2D*/,
  lowerBounds/*: Vector2*/,
  upperBounds/*: Vector2*/ 
) => {
  particle.position.x = Math.min(upperBounds.x, Math.max(particle.position.x, lowerBounds.x));
  particle.position.y = Math.min(upperBounds.y, Math.max(particle.position.y, lowerBounds.y));
}