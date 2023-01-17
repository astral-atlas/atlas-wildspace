// @flow strict
/*::
import type { RoutesConstructor } from "../../../routes";
*/

import { gameAPI, miniTheaterAPI, miniTheaterAPISpec } from "@astral-atlas/wildspace-models";
import { createMetaRoutes } from "../../meta.js";
import { v4, v4 as uuid } from "uuid";
import { NotFoundError } from "../../meta/gameResource.js";

export const createTerrainRoutes/*: RoutesConstructor*/ = (services) => {
  const { createDynamoDBGameResourceRoute } = createMetaRoutes(services);

  const terrainPropRoutes = createDynamoDBGameResourceRoute(miniTheaterAPISpec["/games/mini-theater/terrain-prop/v2"], {
    database: services.data.gameData.miniTheater.terrainProps,
    create(meta, input) {
      return {
        ...meta,
        ...input,
      };
    },
  });

  const http = [
    ...terrainPropRoutes,
  ];
  const ws = [

  ];
  return { http, ws }
}