// @flow strict
import { c } from "@lukekaalim/cast";

/*::
import type { Cast } from "@lukekaalim/cast";

export type PlainTextDocumentID = string;
export type PlainTextDocument = {
  id: PlainTextDocumentID,

  title: string,
  text: string,

  tags: $ReadOnlyArray<string>,
};
*/
export const castPlainTextDocumentID/*: Cast<PlainTextDocumentID>*/ = c.str;
export const castPlainTextDocument/*: Cast<PlainTextDocument>*/ = c.obj({
  id: castPlainTextDocumentID,

  title: c.str,
  text: c.str,

  tags: c.arr(c.str),
})