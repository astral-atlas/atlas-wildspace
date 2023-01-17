// @flow strict
/*::
import type { Component, Ref } from '@lukekaalim/act';
*/

import { h, useRef } from "@lukekaalim/act";
import styles from './index.module.css';

/*::
export type EditorFormProps = {
  onEditorSubmit?: () => mixed,
  [string]: mixed,
};
*/

export const EditorForm/*: Component<EditorFormProps>*/ = ({ children, onEditorSubmit, ...props }) => {
  const onSubmit = (event) => {
    event.preventDefault();
    onEditorSubmit && onEditorSubmit();
  };
  return h('form', { ...props, onSubmit, classList: [styles.editorForm] }, children)
};
/*::
export type EditorFormSubmitProps = {
  label?: string,
};
*/

export const EditorFormSubmit/*: Component<EditorFormSubmitProps>*/ = ({ label = '' }) => {
  return h('input', { type: 'submit', value: label || 'Submit', classList: [styles.editorFormSubmit] })
}

/*::
export type TextEditorProps = {
  label?: string,
  text?: string,
  disabled?: boolean,
  onTextChange?: string => mixed,
  onTextInput?: string => mixed,
  [string]: mixed,
};
*/

export const EditorTextInput/*: Component<TextEditorProps>*/ = ({
  text = '', label, disabled,
  onTextChange, onTextInput
}) => {
  const onChange = onTextChange && ((event) => {
    onTextChange(event.target.value);
  });
  const onInput = onTextInput && ((event) => {
    onTextInput(event.target.value);
  });
  return h('label', { classList: [styles.editorRoot] }, [
    h('span', {}, label),
    h('input', { type: 'text', value: text, onInput, onChange, disabled })
  ]);
};

/*::
export type NumberEditorProps = {
  label?: string,
  number?: number,
  disabled?: boolean,
  onNumberChange?: number => mixed,
  onNumberInput?: number => mixed,
  min?: number,
  max?: number,
  [string]: mixed,
};
*/
export const EditorNumberInput/*: Component<NumberEditorProps>*/ = ({
  number = 0, label, disabled,
  onNumberChange, onNumberInput,
  min, max,
}) => {
  const onChange = onNumberChange && ((event) => {
    onNumberChange(event.target.valueAsNumber);
  });
  const onInput = onNumberInput && ((event) => {
    onNumberInput(event.target.valueAsNumber);
  });
  return h('label', { classList: [styles.editorRoot] }, [
    h('span', {}, label),
    h('input', { type: 'number', value: number, min, max, onInput, onChange, disabled })
  ]);
};


export const EditorTextAreaInput/*: Component<TextEditorProps>*/ = ({
  text = '', label, disabled,
  onTextChange, onTextInput
}) => {
  const onChange = onTextChange && ((event) => {
    onTextChange(event.target.value);
  });
  const onInput = onTextInput && ((event) => {
    onTextInput(event.target.value);
  });
  return h('label', { classList: [styles.editorRoot] }, [
    h('span', {}, label),
    h('textarea', { value: text, onInput, onChange, disabled })
  ]);
};

/*::
export type SingleFileEditorProps = {
  label?: string,
  multiple?: boolean,
  accept?: string,
  files?: ?FileList,
  onFilesChange?: FileList => mixed,
  [string]: mixed,
};
*/

export const FilesEditor/*: Component<SingleFileEditorProps>*/ = ({
  files,
  label,
  onFilesChange,
  multiple,
  accept,
}) => {
  const onInput = (event) => {
    onFilesChange && onFilesChange(event.target.files);
  }
  return h('label', { classList: [styles.editorRoot] }, [
    h('span', {}, label),
    h('input', { type: 'file', multiple, accept, onInput, files })
  ]);
};

/*::
export type SelectEditorProps = {
  label?: string,
  selected?: ?string,
  disabled?: boolean,
  ref?: ?Ref<?HTMLSelectElement>,
  groups?: { title: string, values: { title?: string, value: string }[] }[],
  values?: { title?: string, value: string }[],
  onSelectedChange?: (string, Event) => mixed,
  [string]: mixed,
};
*/
export const SelectEditor/*: Component<SelectEditorProps>*/ = ({
  label,
  ref,
  selected,
  disabled,
  values = [],
  groups = [],
  onSelectedChange,
  ...props
}) => {
  const onChange = (event) => {
    onSelectedChange && onSelectedChange(event.target.value, event);
  }
  return h('label', { ...props, classList: [styles.editorRoot] }, [
    h('span', {}, label),
    h('select', { ref, onChange, disabled }, [
      values.map(({ title, value }) =>
        h('option', { key: value, value, selected: value === selected }, title || value)),
      groups.map(({ title, values}) =>
        h('optgroup', { key: title, label: title }, values.map(({ title, value }) =>
          h('option', { key: value, value, selected: value === selected }, title || value)))),
    ])
  ]);
}


/*::
export type EditorButtonProps = {
  label?: string,
  type?: string,
  disabled?: boolean,
  onButtonClick?: () => mixed,
  [string]: mixed,
};
*/
export const EditorButton/*: Component<EditorButtonProps>*/ = ({
  label,
  onButtonClick,
  type = 'button',
  disabled,
  ...props
}) => {
  const onClick = () => {
    onButtonClick && onButtonClick();
  }
  return h('button', { ...props, disabled, type, onClick, classList: [styles.editorRoot] }, label);
}

/*::
export type FilesButtonEditorProps = {
  label?: string,
  multiple?: boolean,
  accept?: string,
  disabled?: boolean,
  onFilesChange?: File[] => mixed,
};
*/
export const FilesButtonEditor/*: Component<FilesButtonEditorProps>*/ = ({
  label,
  multiple,
  disabled,
  accept,
  onFilesChange,
}) => {
  const ref = useRef();
  const onChange = (event) => {
    onFilesChange && onFilesChange([...event.target.files]);
  };
  const onButtonClick = () => {
    const { current: input } = ref;
    if (!input)
      return;
    input.click();
  }
  return [
    h('input', { ref, style: { display: 'none' }, type: 'file', multiple, accept, onChange }),
    h(EditorButton, { disabled, label, onButtonClick })
  ]
}

/*::
export type EditorHorizontalSectionProps = {

};
*/

export const EditorHorizontalSection/*: Component<EditorHorizontalSectionProps>*/ = ({
  children,
}) => {
  return h('section', { classList: [styles.editorHorizontalSection]}, children)
}
/*::
export type EditorVerticalSectionProps = {

};
*/

export const EditorVerticalSection/*: Component<EditorVerticalSectionProps>*/ = ({
  children,
}) => {
  return h('section', { classList: [styles.editorVerticalSection]}, children)
}

/*::
export type EditorCheckboxInputProps = {
  label?: string,
  checked?: boolean,
  onCheckedChange?: boolean => mixed,
};
*/

export const EditorCheckboxInput/*: Component<EditorCheckboxInputProps>*/ = ({
  label,
  checked,
  onCheckedChange,
}) => {
  const onChange = (event) => {
    onCheckedChange && onCheckedChange(event.target.checked);
  }
  return [
    h('label', { classList: [styles.editorRoot] }, [
      h('span', {}, label),
      h('input', { type: 'checkbox', checked, onChange })
    ])
  ]
}

export { styles as editorStyles };