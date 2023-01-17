// @flow strict
/*::
import type { WikiData } from '../../wiki.js';
import type { WildspaceDataSources } from "../../sources";
*/
import { castWikiDoc, castWikiDocConnection, castWikiDocEvent, castWikiDocFocus } from "@astral-atlas/wildspace-models";

export const createTableWikiData = (sources/*: WildspaceDataSources*/)/*: WikiData*/ => {
  const documents = {
    ...sources.createCompositeTable('wiki_documents', castWikiDoc),
    ...sources.createTransactable('wiki_documents', castWikiDoc, 'version')
  };
  const documentEvents = sources.createChannel('wiki_document_events', castWikiDocEvent);
  const documents2 = sources.createDynamoDBTable('wiki_documents_2', castWikiDoc);
  
  const documentFocus = sources.createCompositeTable('wiki_focus', castWikiDocFocus)
  const documentConnections = sources.createCompositeTable('wiki_connections', castWikiDocConnection)

  return {
    documents,
    documentEvents,
    documentConnections,
    documentFocus,
    documents2,
  };
}