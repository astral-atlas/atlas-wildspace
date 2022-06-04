// @flow strict
/*::
import type { Page } from "..";
*/

import { h, useRef, useState } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import indexText from './index.md?raw';
import { GeometryDemo } from "../demo";
import { sprite, useDisposable } from '@lukekaalim/act-three';
import { EditorForm, EditorRangeInput, getVector2ForKeyboardState, useElementKeyboard, useKeyboardTrack, useParticle2dSimulation } from '@astral-atlas/wildspace-components';
import { Box2, Color, SpriteMaterial, Vector2 } from "three";

const ParticleDemo = () => {
  const ref = useRef();
  const containerRef = useRef();

  const emitter = useElementKeyboard(containerRef)
  const track = useKeyboardTrack(emitter)

  const [drag, setDrag] = useState(1/10);
  const [maxVelocity, setMaxVelocity] = useState(1/1000);
  const [acceleration, setAcceleration] = useState(0.0001);

  const [particle, simulateParticle] = useParticle2dSimulation(
    new Box2(new Vector2(-5, -5), new Vector2(5, 5)),
    drag,
    maxVelocity,
    new Vector2(0, 0)
  )
  const material = useDisposable(() => {
    return new SpriteMaterial({ color: new Color('red') })
  }, []);

  const simulate = (loop, vars) => {
    const { next } = track.readDiff()
    const direction = getVector2ForKeyboardState(next.value)
    simulateParticle(direction.multiplyScalar(acceleration), vars.delta);
    const { current: particleSprite } = ref;
    if (particleSprite) {
      particleSprite.position.set(-particle.position.x, 0, particle.position.y);
    }
  }
  
  return h('div', { ref: containerRef, tabIndex: 0 }, [
    h(GeometryDemo, { simulate },
      h(sprite, { ref, center: new Vector2(0.5, 0.5), material })),
    h(EditorForm, {}, [
      h(EditorRangeInput, { max: 1, step: 0.001, min: 0, number: drag, onNumberInput: drag => setDrag(drag), label: `Drag ${drag}` }),
      h(EditorRangeInput, { max: 0.01, step: 0.0001, min: 0, number: maxVelocity, onNumberInput: v => setMaxVelocity(v), label: `Max Velocity (${maxVelocity})` }),
      h(EditorRangeInput, { step: 0.00001, min: 0, max: 0.001, number: acceleration, onNumberInput: a => setAcceleration(a), label: `Acceleration (${acceleration})` }),
    ])
  ])
}

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'particle2d':
      return h(ParticleDemo)
    default:
      return null;
  }
}

export const particlePage/*: Page*/ = {
  link: {
    href: '/particle',
    children: [],
    name: "Particle"
  },
  content: h(Document, {}, h(Markdown, { text: indexText, directives: { demo: Demo }}))
};

export const particlePages = [
  particlePage,
];
