// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
import type { Cast } from "@lukekaalim/cast";
*/

import { h } from "@lukekaalim/act";
import {
  EditorCheckboxInput,
  EditorNumberInput,
  EditorTextInput,
  SelectEditor,
} from "../editor/form";
import { c } from "@lukekaalim/cast/shorthand";

/*::
export type FormSchema<T = mixed> = {
  ...(
    | { type: 'unknown' }
    | { type: 'string' }
    | { type: 'number' }
    | { type: 'boolean' }
    | { type: 'literal', value: string | number | boolean | null }
    | { type: 'union', values: FormSchema<>[], discriminatingKey: null | string }
    | { type: 'tuple', values: FormSchema<>[] }
    | { type: 'array', element: FormSchema<> }
    | { type: 'object', props: { [string]: FormSchema<mixed> } }
  ),
  disabled?: boolean,
  label?: string,
};

export type LibraryEditorFormProps = {
  formSchema: FormSchema<>,
  value: mixed,

  onValueChange?: mixed => mixed,
}
*/

export const renderLibraryEditorForm = /*:: <T>*/(
  formSchema/*: FormSchema<T>*/,
  value/*: T*/,
  onValueChange/*: T => mixed*/ = _ => {},
  castValue/*: Cast<T>*/
)/*: ElementNode*/ => {
  const onFormValueChange = (formValue) => {
    onValueChange(castValue(formValue))
  }

  return h(LibraryEditorForm, {
    formSchema,
    value,
    onValueChange: onFormValueChange
  })
}

const castOrDefault = /*:: <T>*/(cast/*: Cast<T>*/, defaultValue/*: T*/)/*: Cast<T>*/ => {
  return (value) => {
    try {
      return cast(value)
    } catch (error) {
      return defaultValue;
    }
  }
}

const string = castOrDefault(c.str, '');
const number = castOrDefault(c.num, 0);
const boolean = castOrDefault(c.bool, false);

export const LibraryEditorForm/*: Component<LibraryEditorFormProps>*/ = ({
  formSchema,
  value,
  onValueChange = _ => {}
}) => {
  const { disabled, label } = formSchema;
  switch (formSchema.type) {
    case 'string':
      return h(EditorTextInput, {
        label,
        text: string(value),
        disabled,
        onTextChange: value => onValueChange(value),
      })
    case 'boolean':
      return h(EditorCheckboxInput, {
        label, 
        checked: boolean(value),
        disabled,
        onCheckedChange: value => onValueChange(value),
      })
    case 'number':
      return h(EditorNumberInput, {
        label, 
        number: number(value),
        disabled,
        onNumberChange: value => onValueChange(value),
      })
    case 'union':
      return h(UnionEditor, { formSchema, value, onValueChange });
    case 'object':
      if (typeof value !== 'object' || !value)
        return h(ObjectEditor, { formSchema, value: {}, onValueChange });

      return h(ObjectEditor, { formSchema, value, onValueChange })
    default:
      return null;
  }
};

const ObjectEditor = ({ formSchema, value, onValueChange }) => {
  return Object
    .keys(formSchema.props)
    .map(key => {
      const childSchema = formSchema.props[key];
      const childValue = value[key];
      return h(LibraryEditorForm, {
        formSchema: childSchema,
        value: childValue,
        onValueChange: nextChildValue => onValueChange({ ...value, [key]: nextChildValue }),
      });
    });
}

const UnionEditor = ({ formSchema, value, onValueChange }) => {
  const { discriminatingKey } = formSchema;
  if (discriminatingKey) {
    return h(DiscriminatingKeyedUnion, { formSchema, discriminatingKey, value, onValueChange })
  }
  return null;
}

const DiscriminatingKeyedUnion = ({ formSchema, discriminatingKey, value, onValueChange }) => {
  const { label, disabled } = formSchema
  if (typeof value !== 'object' || !value)
    return null;
  const discriminatingValue = value[discriminatingKey];
  if (typeof discriminatingValue !== 'string')
    return null;

  const selectedSchema = formSchema.values.map(s =>
    s.type === 'object'
    && s.props[discriminatingKey].type === 'literal'
    && s.props[discriminatingKey].value === discriminatingValue
    && s
    || null
  ).filter(Boolean).find(Boolean);
  const keys = selectedSchema
    && Object.keys(selectedSchema.props);

  const props = keys && Object.fromEntries(
    keys
      .filter(key => key !== discriminatingKey)
      .map(key => selectedSchema && [key, selectedSchema.props[key]] || null)
      .filter(Boolean)
  );

  const onSelectedValueChange = (value) => {
    onValueChange({ ...value, [discriminatingKey]: discriminatingValue });
  }

  return [
    h(SelectEditor, {
      label,
      disabled,
      values: formSchema.values.map(v => {
        if (v.type !== 'object')
          return null;
        const discriminatingSchema = v.props[discriminatingKey];
        if (discriminatingSchema.type !== 'literal')
          return null;

        return { value: (discriminatingSchema.value || "").toString() };
      }).filter(Boolean),
      selected: discriminatingValue,
      onSelectedChange: nextDiscriminatingValue => onValueChange({
        ...value,
        [discriminatingKey]: nextDiscriminatingValue
      }),
    }),
    !!props && !!selectedSchema && h(ObjectEditor, {
      value,
      formSchema: { ...selectedSchema, props },
      onValueChange: onSelectedValueChange,
    })
  ];
}