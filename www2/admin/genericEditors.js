// @flow strict
/*:: import type { Game } from '@astral-atlas/wildspace-models'; */
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { clientContext, useAsync } from './hooks.js';

import styles from './index.module.css';

export const StringListEditor/*: Component<{ values: $ReadOnlyArray<string>, onChange: string[] => mixed, valueName: string }>*/ = ({ values, onChange, valueName }) => {
  const [newValue, setNewValue] = useState('');

  return [
    h('div', { class: styles.userListEditor }, [
      h('label', { class: styles.addNewPlayer }, [
        h('input', { type: 'text', value: newValue, onChange: e => setNewValue(e.target.value) }),
        h('button', { onClick: (e) => (e.preventDefault(), onChange([...values, newValue]), setNewValue('')) }, `Add new ${valueName}`),
      ]),
      ...values.map((user, index) => h('div', {}, [
        h('input', { type: 'text', value: user, onChange: e => onChange([...values.map((v, i) => i === index ? e.target.value : v)]) }),
        h('button', { onClick: (e) => (e.preventDefault(), onChange([...values.filter((v, i) => i !== index)])) }, `Remove ${valueName}`),
      ])),
    ]),
  ]
};