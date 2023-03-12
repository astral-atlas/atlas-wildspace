// @flow strict

import { TextInput } from "@astral-atlas/wildspace-components";
import { h, useState } from "@lukekaalim/act"
import { FramePresenter, OutputPresenter } from "./presentation";
import { TextBlock } from "@lukekaalim/act-rehersal/rehersal2/components/TextBlock";
/*::
import type { Component } from "@lukekaalim/act";
*/

export const TextInputDemo/*: Component<>*/ = () => {
  const [text, setText] = useState('');
  const [fastText, setFastText] = useState('');

  return [
    h(FramePresenter, {}, [
      h(TextInput, { label: 'Update Text on Change Event', text, onTextChange: setText }),

      h(TextInput, { label: 'Update Text on Input Event', text: fastText, onTextInput: setFastText }),
    ]),
    h(TextBlock, {}, [
      h(OutputPresenter, { outputs: [
        text || '<No Input>',
        fastText || '<No Input>',
      ]})
    ])
  ]
}