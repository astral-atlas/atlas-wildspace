// @flow strict

import { createResourceRoutes } from "@lukekaalim/http-server";
import { promises } from 'fs';
import { join } from 'path';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { Readable } from "stream";

/*::
import type { RoutesConstructor } from "../routes";
*/

const packagePath = join(new URL(import.meta.url || __dirname).pathname, '../../package.json');

export const createHomeRoutes/*: RoutesConstructor*/ = (services) => {
  const homeRoutes = createResourceRoutes({
    path: '/',
    methods: {
      async GET(request) {
        console.log(packagePath);
        const { name, version } = JSON.parse(await promises.readFile(packagePath, 'utf-8'));
        return {
          status: HTTP_STATUS.ok,
          headers: { ['Content-Type']: 'application/json' },
          body: Readable.from(JSON.stringify({ name, version, config: services.config }))
        }
      }
    }
  })


  const http = [
    ...homeRoutes
  ];
  const ws = [];
  return { http, ws };
}