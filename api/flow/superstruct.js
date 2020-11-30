// @flow strict
/*::

declare module "superstruct" {
  declare opaque type Struct<+T>;
  declare class StructError extends Error {
    type: string,
    path: (string | number)[],
  }

  declare type StructOf<UnknownStruct> = $Call<<Z>(s: Struct<Z>) => Z, UnknownStruct>;

  declare module.exports: {
    StructError: typeof StructError,
    validate: <T>(value: mixed, struct: Struct<T>) => [StructError, T],
    coerce: <T>(value: mixed, struct: Struct<T>) => T,
    is: <T>(value: mixed, struct: Struct<T>) => boolean,

    array: <Element>(element: Struct<Element>) => Struct<Element[]>,
    boolean: () => Struct<boolean>,
    string: () => Struct<string>,
    number: () => Struct<number>,
    object: <Props>(props: Props) => Struct<$ObjMap<Props, <S>(s: Struct<S>) => S>>
  };
}
*/