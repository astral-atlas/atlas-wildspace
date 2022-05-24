// @flow strict

import { Vector2 } from "three";

/*::
export type Particle2D = {
  position: Vector2,
  velocityPerMs: Vector2
};
export type ParticleSettings = {
  dragCoefficent?: number,
  velocityMagnitudeMax?: number,
};
*/

const magnitude = (vector) => Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
const mult = (vector, scalar) => [vector[0] * scalar, vector[1] * scalar];

export const simulateParticle2D = (
  particle/*: Particle2D*/,
  { velocityMagnitudeMax = 1, dragCoefficent = 0.1 }/*: ParticleSettings*/,
  accelerationPerMs/*: Vector2*/,
  durationMs/*: number*/,
)/*: void*/ => {
  const decayedVelocity = [
    particle.velocityPerMs.x * Math.pow(dragCoefficent, durationMs / 1000),
    particle.velocityPerMs.y * Math.pow(dragCoefficent, durationMs / 1000)
  ];

  const newVelocity = [
    decayedVelocity[0] + (accelerationPerMs.x * durationMs),
    decayedVelocity[1] + (accelerationPerMs.y * durationMs)
  ]
  const velocityMagnitude = magnitude(newVelocity)
  const clampedVelocityMagnitude = Math.min(velocityMagnitudeMax, velocityMagnitude);

  const clampedVelocity = mult(newVelocity, ((1/velocityMagnitude) * clampedVelocityMagnitude) || 0);

  // Write to Particle
  particle.position.x = particle.position.x + (clampedVelocity[0] * durationMs);
  particle.position.y = particle.position.y + (clampedVelocity[1] * durationMs);
  particle.velocityPerMs.x = clampedVelocity[0];
  particle.velocityPerMs.y = clampedVelocity[1];
}

export const clampParticlePosition = (
  particle/*: Particle2D*/,
  lowerBounds/*: Vector2*/,
  upperBounds/*: Vector2*/ 
) => {
  particle.position.x = Math.min(upperBounds.x, Math.max(particle.position.x, lowerBounds.x));
  particle.position.y = Math.min(upperBounds.y, Math.max(particle.position.y, lowerBounds.y));
}