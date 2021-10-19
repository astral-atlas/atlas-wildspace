// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { EncounterState } from '@astral-atlas/wildspace-models'; */
import { h } from '@lukekaalim/act';


export const TurnControl/*: Component<{ state: EncounterState, onStateUpdate: EncounterState => mixed }>*/ = ({ state, onStateUpdate }) => {
  const onNextTurnClick = () => {
    onStateUpdate({ ...state, turnIndex: state.turnIndex + 1 % state.turnOrder.length })
  };

  const onBackTurnClick = () => {
    onStateUpdate({ ...state, turnIndex: (state.turnOrder.length + state.turnIndex - 1) % state.turnOrder.length })
  };

  return [
    h('button', { onClick: onNextTurnClick }, 'Next Turn'),
    h('button', { onClick: onBackTurnClick }, 'Prev Turn'),
  ]
}