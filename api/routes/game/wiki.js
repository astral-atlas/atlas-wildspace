// @flow strict
/*:: import type { RoutesConstructor } from "../../routes.js"; */

import { createCRUDConstructors } from '../meta.js';
import { emptyRootNode, scenesAPI, wikiAPI } from '@astral-atlas/wildspace-models';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { v4 as uuid } from 'uuid';
import {  } from "@astral-atlas/wildspace-models";

export const createWikiRoutes/*: RoutesConstructor*/ = (services) => {
  const { createGameCRUDRoutes } = createCRUDConstructors(services);

  const wikiRoutes = createGameCRUDRoutes(wikiAPI["/game/wiki"], {
    name: 'wikiDoc',
    idName: 'wikiDocId',
    gameUpdateType: 'wikiDoc',

    async create({ game, grant }, { title }) {
      const document = {
        gameId: game.id,
        id: uuid(),
        title,

        rootNode: emptyRootNode.toJSON(),
        version: 0,
        lastUpdatedBy: grant.identity,
      };
      await services.data.wiki.documents.set(game.id, document.id, document)
      return document;
    },
    async read({ game }) {
      const { result: wikiDocs } = await services.data.wiki.documents.query(game.id)
      return wikiDocs;
    },
    async update({ game }, wikiDocId, { title }) {
      const { result: wikiDoc } = await services.data.wiki.documents.get(game.id, wikiDocId)
      if (!wikiDoc)
        throw new Error();
      const nextWikiDoc = {
        ...wikiDoc,
        title
      };
      await services.data.wiki.documents.set(game.id, wikiDocId, nextWikiDoc)
      return nextWikiDoc;
    },
    async destroy({ game }, wikiDocId) {
      await services.data.wiki.documents.set(game.id, wikiDocId, null)
    },
  });

  const http = [
    ...wikiRoutes,
  ];
  const ws = [

  ];
  return { http, ws };
};
