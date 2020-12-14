// @flow strict
/*:: import type { HTTPClient, HTTPResponse } from '@lukekaalim/http-client'; */
/*:: import type { JSONValue } from './json'; */
const { stringify, parse } = require('./json');

class UnexpectedResponseError extends Error {
  /*:: response: HTTPResponse */;

  constructor(response/*: HTTPResponse*/) {
    super();
    this.response = response;
  }
}

/*::
type RESTClient = {
  post: (request: RESTRequest) => Promise<{ location: string | null, content: JSONValue }>,
  get: (request: RESTRequest) => Promise<{ content: JSONValue }>,
  put: (request: RESTRequest) => Promise<{ content: JSONValue }>,
  delete: (request: RESTRequest) => Promise<{}>,
};

type RESTRequest = {
  resource: string,
  params?: { [string]: string },
  content?: JSONValue,
  headers?: ([string, string])[]
}

type RESTAuthorization =
  | { type: 'none' }
  | { type: 'basic', username: string, password: string }
  | { type: 'bearer', token: string };

type RESTOptions = {
  endpoint: URL,
  client: HTTPClient,
  auth?: RESTAuthorization,
};

export type {
  RESTClient,
  RESTRequest,
  RESTAuthorization,
};
*/

const getAuthHeader = (auth/*: RESTAuthorization*/)/*: null | [string, string]*/ => {
  switch (auth.type) {
    case 'none':
      return null;
    case 'basic':
      const credentials = `${auth.username}:${auth.password}`;
      return [
        'Authorization',
        `Basic ${btoa(credentials)}`
      ];
    case 'bearer':
      return [
        'Authorization',
        `Bearer ${auth.token}`
      ];
    default:
      throw new Error(`Unrecognized authorization`);
  }
};

const createRESTClient = ({ endpoint, client, auth = { type: 'none' }}/*: RESTOptions*/)/*: RESTClient*/ => {
  const getURL = (resource, params = {}) => {
    const resourceURL = new URL(endpoint.href);

    resourceURL.pathname = [
      ...resourceURL.pathname.split('/'),
      ...resource.split('/')
    ].filter(Boolean).join('/');
    const paramList/*: [string, string][]*/ = (Object.entries(params)/*: any*/);

    resourceURL.search = new URLSearchParams(paramList).toString();
    return resourceURL.href;
  };
  const getBody = (content) => {
    return content !== undefined ? stringify(content) : undefined;
  }
  const getContentHeaders = (content)/*: null | [string, string]*/ => {
    if (content === undefined)
      return null;
    return ['Content-Type', 'application/json'];
  };
  const getHeaders = (headers = [], content = null) => {
    return [
      getAuthHeader(auth),
      getContentHeaders(content),
      ...headers,
    ].filter(Boolean);
  };
  const getHeaderValue = (headers, headerName) => {
    const header = headers.find(([name]) => name.toLowerCase() === headerName.toLowerCase());
    if (!header)
      return null;
    return header.value;
  }
  const getResponse = async (method, request) => {
    const { resource, params, content, headers } = request;
  
    const response = await client.sendRequest({
      url: getURL(resource, params),
      headers: getHeaders(headers, content),
      method,
      body: getBody(content)
    });

    return response;
  };

  const post = async (request/*: RESTRequest*/) => {
    const response = await getResponse('POST', request);

    if (response.status !== 201)
      throw new UnexpectedResponseError(response);

    return {
      location: getHeaderValue(response.headers, 'Location'),
      content: parse(response.body),
    };
  };
  const get = async (request/*: RESTRequest*/) => {
    const response = await getResponse('GET', request);

    if (response.status !== 200)
      throw new UnexpectedResponseError(response);

    return {
      content: parse(response.body),
    };
  };
  const put = async (request/*: RESTRequest*/) => {
    const response = await getResponse('PUT', request);

    if (response.status !== 200 && response.status !== 204)
      throw new UnexpectedResponseError(response);

    if (response.status === 204)
      return { content: null };

    return {
      content: parse(response.body),
    };
  };
  const _delete = async (request/*: RESTRequest*/) => {
    const response = await getResponse('DELETE', request);

    if (response.status !== 204)
      throw new UnexpectedResponseError(response);

    return {};
  };

  return {
    post,
    get,
    put,
    delete: _delete,
  };
};

module.exports = {
  UnexpectedResponseError,
  createRESTClient,
  getAuthHeader,
};
