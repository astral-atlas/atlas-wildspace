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
      const doc = emptyRootNode.toJSON();
      const document = {
        gameId: game.id,
        id: uuid(),
        title,
        version: uuid(),

        content: doc,
        visibility: { type: 'game-master-in-game' },
        history: [{ type: 'doc', doc, version: uuid() }],
        tags: []
      };
      await services.data.wiki.documents2.set2({
        key: { partition: game.id, sort: document.id },
        item: document,
      })
      return document;
    },
    async read({ game }) {
      const { results: wikiDocs } = await services.data.wiki.documents2.query(game.id)
      return wikiDocs.map(r => r.result);
    },
    async update({ game }, wikiDocId, { title }) {
      const { result: wikiDoc } = await services.data.wiki.documents2.get({ partition: game.id, sort: wikiDocId });
      if (!wikiDoc)
        throw new Error();
      const nextWikiDoc = {
        ...wikiDoc,
        title
      };
      await services.data.wiki.documents2.set2({
        key: { partition: game.id, sort: wikiDoc.id },
        item: nextWikiDoc,
      })
      return nextWikiDoc;
    },
    async destroy({ game }, wikiDocId) {
      await services.data.wiki.documents2.remove({ partition: game.id, sort: wikiDocId })
    },
  });

  const http = [
    ...wikiRoutes,
  ];
  const ws = [

  ];
  return { http, ws };
};
