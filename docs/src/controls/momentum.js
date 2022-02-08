// @flow strict

/*::
export type Particle2D = {
  position: [number, number],
  velocityPerMs: [number, number]
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
  accelerationPerMs/*: [number, number]*/,
  durationMs/*: number*/,
)/*: Particle2D*/ => {
  const decayedVelocity = [
    particle.velocityPerMs[0] * Math.pow(dragCoefficent, durationMs / 1000),
    particle.velocityPerMs[1] * Math.pow(dragCoefficent, durationMs / 1000)
  ];

  const newVelocity = [
    decayedVelocity[0] + (accelerationPerMs[0] * durationMs),
    decayedVelocity[1] + (accelerationPerMs[1] * durationMs)
  ]
  const velocityMagnitude = magnitude(newVelocity)
  const clampedVelocityMagnitude = Math.min(velocityMagnitudeMax, velocityMagnitude);

  const clampedVelocity = mult(newVelocity, ((1/velocityMagnitude) * clampedVelocityMagnitude) || 0);

  const newPosition = [
    particle.position[0] + (clampedVelocity[0] * durationMs),
    particle.position[1] + (clampedVelocity[1] * durationMs)
  ];

  return {
    position: newPosition,
    velocityPerMs: clampedVelocity,
  }
}