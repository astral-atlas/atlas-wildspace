// @flow strict
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */

/*::
export type APIEndpoint<Req: JSONValue, Res: JSONValue, Query: { [string]: string }> = {
  method: 'GET' | 'POST',
  path: string,
  toQuery: Cast<Query>,
  toRequestBody: Cast<Req>,
  toResponseBody: Cast<Res>
};
*/

const createEndpoint = /*:: <Req: JSONValue, Res: JSONValue, Query: { [string]: string }>*/(
  method/*: 'GET' | 'POST'*/,
  path/*: string*/,
  toQuery/*: Cast<Query>*/,
  toRequestBody/*: Cast<Req>*/,
  toResponseBody/*: Cast<Res>*/
)/*: APIEndpoint<Req, Res, Query>*/ => ({
  method,
  path,
  toQuery,
  toRequestBody,
  toResponseBody,
});

module.exports = {
  createEndpoint,
};
