// @flow strict

/*::
export type JSONEditorSchema<T = mixed> = (
  | { type: 'string' }
  | { type: 'number' }
  | { type: 'boolean' }
  | { type: 'literal', value: string | number | boolean | null }
  | { type: 'union', values: FormSchema<>[], discriminatingKey: null | string }
  | { type: 'tuple', values: FormSchema<>[] }
  | { type: 'array', element: FormSchema<> }
  | { type: 'object', props: { [string]: FormSchema<mixed> } }
)
export type AssetSchema =
  | { type: 'image' }
  | { type: 'audio' }
  | { type: 'model' }

export type WildspaceEditorSchema<T = mixed> = (
  | { type: 'asset', assetSchema: AssetSchema }
);

export type MetaFormSchema<T> = {|
  ...T,
  disabled?: boolean,
  label?: string,
|};


export type FormSchema<T = mixed> = MetaFormSchema<
  | JSONEditorSchema<T>
  | WildspaceEditorSchema<T>
>
*/