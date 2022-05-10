// @flow strict
/*::
import type { TableDataConstructors } from './index.js';
import type { WikiData } from '../../wiki.js';
*/
import { castWikiDoc, castWikiDocUpdate } from "@astral-atlas/wildspace-models";

export const createTableWikiData = (constructors/*: TableDataConstructors*/)/*: WikiData*/ => {
  const documents = constructors.createCompositeTable('wiki/documents', castWikiDoc);
  const documentUpdates = constructors.createChannel('wiki/document_updates', castWikiDocUpdate);

  return {
    documents,
    documentUpdates,
  };
}