// @flow strict
/*:: import type { ResourceRequest, RouteResponse, Content } from '@lukekaalim/server';*/
const { getResponseForError, BadContentType, BadStructure, BadRequestBodyError } = require('../errors');

/*::
type Handler = ResourceRequest => Promise<RouteResponse>;

export type {
  Handler,
};
*/

const withErrorHandling = (
  handler/*: Handler*/
)/*: Handler*/ => async (req) => {
  try {
    return await handler(req);
  } catch (error) {
    return getResponseForError(error);
  }
};

/*::
type StructureRequest<T> = {
  ...ResourceRequest,
  content: { type: 'json', value: T }
};
*/

const validateContent = /*::<T>*/(content/*: Content*/, validator/*: mixed => T*/)/*: T*/ => {
  try {
    if (content.type !== 'json')
      throw new BadContentType('application/json');

    const value = validator(content.value);

    return value;
  } catch (error) {
    throw new BadRequestBodyError(error.message);
  }
};

module.exports = {
  withErrorHandling,
  withErrorHandling,
  validateContent,
};