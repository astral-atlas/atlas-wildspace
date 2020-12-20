// @flow strict
/*:: import type { JSONValue } from '@lukekaalim/cast'; */
/*:: import type { APIEndpoint } from '@astral-atlas/wildspace-models'; */
/*:: import type { RESTClient } from './rest'; */

/*::
export type EndpointClient<RequestBody, ResponseBody, Query> = {
  request: (query: Query, body: RequestBody) => Promise<ResponseBody>,
};
*/

const createEndpointClient = /*:: <RQ: JSONValue, RS: JSONValue, Q: { [string]: string }> */(
  rest/*: RESTClient*/,
  endpoint/*: APIEndpoint<RQ, RS, Q>*/
)/*: EndpointClient<RQ, RS, Q>*/ => {
  const getRequest = async (query) => {
    const { content } = await rest.get({ resource: endpoint.path, params: query });
    return endpoint.toResponseBody(content);
  };
  const postRequest = async (query, body) => {
    const { content } = await rest.post({ resource: endpoint.path, params: query, content: body });
    return endpoint.toResponseBody(content);
  };

  switch (endpoint.method.toUpperCase()) {
    case 'GET':
      return { request: getRequest };
    case 'POST':
      return { request: postRequest };
    default:
      throw new Error();
  };
};

module.exports = {
  createEndpointClient,
};
