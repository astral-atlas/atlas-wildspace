// @flow strict
/*:: import type { ResourceRequest, RouteResponse } from '@lukekaalim/server'; */
const { badRequest, unauthorized, forbidden, internalServerError, notFound } = require('@lukekaalim/server')

class MissingAuthenticationError extends Error {
  type/*: 'MissingAuthentication'*/ = 'MissingAuthentication'
  constructor() {
    super(`The provided request has no authentication credentials`);
  }
}
class UnsupportedAuthorizationError extends Error {
  type/*: 'UnsupportedAuthorization'*/ = 'UnsupportedAuthorization'
  constructor() {
    super(`The provided authorization is not a supported type`);
  }
}
class InvalidAuthenticationError extends Error {
  type/*: 'InvalidAuthentication'*/ = 'InvalidAuthentication'
  constructor() {
    super(`The provided request has credentials that refer to a user that does not exist, or are incorrect`);
  }
}
class InvalidPermissionError extends Error {
  type/*: 'InvalidPermission'*/ = 'InvalidPermission'
  /*:: resource: string*/
  /*:: reason: string*/
  constructor(resource/*: string*/, reason/*: string*/) {
    super(`The provided credentials were insufficient for accessing ${resource} because ${reason}`);
    this.resource = resource;
    this.reason = reason;
  }
}
class NonexistentResourceError extends Error {
  type/*: 'NonexistentResource'*/ = 'NonexistentResource'
  /*:: resource: string*/
  /*:: reason: string*/
  constructor(resource/*: string*/, reason/*: string*/) {
    super(`Could not retrieve ${resource} because ${reason}`);
    this.resource = resource;
    this.reason = reason;
  }
}

class PreexistingResourceError extends Error {
  type/*: 'PreexistingResource'*/ = 'PreexistingResource'
  /*:: resource: string*/
  constructor(resource/*: string*/) {
    super(`Could not create ${resource} because a pre-existing resource with that ID exists`);
    this.resource = resource;
  }
}
class MissingParameterError extends Error {
  type/*: 'MissingParameter'*/ = 'MissingParameter'

  constructor(parameter/*: string*/) {
    super(`The request is missing a required parameter, ${parameter}`);
  }
}
class BadRequestBodyError extends Error {
  type/*: 'BadRequestBody'*/ = 'BadRequestBody'
  /*:: reason: string*/

  constructor(reason/*: string*/) {
    super(`The provided request body was invalid because: ${reason}`);
    this.reason = reason;
  }
}

class BadContentType extends BadRequestBodyError {
  constructor(expectedType/*: string*/) {
    super(`Content-Type was not "${expectedType}"`);
  }
}
class BadStructure extends BadRequestBodyError {
  constructor(structureName/*: string*/) {
    super(`Body was not "${structureName}"`);
  }
}
/*::
type APIError =
  | MissingAuthenticationError
  | InvalidAuthenticationError
  | InvalidPermissionError
  | NonexistentResourceError
  | UnsupportedAuthorizationError
  | MissingParameterError
  | BadRequestBodyError
  | PreexistingResourceError

export type {
  APIError,
  MissingAuthenticationError,
  InvalidAuthenticationError,
  InvalidPermissionError,
  NonexistentResourceError,
  UnsupportedAuthorizationError,
  MissingParameterError,
  PreexistingResourceError,
  BadRequestBodyError
};
*/

const getResponseForError = (error/*: APIError*/)/*: RouteResponse*/ => {
  console.log(error);
  if (!error.type)
    return internalServerError(`The API has encountered an unrecoverable error.`);
  
  switch (error.type) {
    case 'InvalidPermission':
      return forbidden({ type: error.type, reason: error.message });
    case 'InvalidAuthentication':
    case 'UnsupportedAuthorization':
    case 'MissingAuthentication':
      return unauthorized({ type: error.type, reason: error.message });
    case 'NonexistentResource':
      return notFound({ type: error.type, reason: error.message });
    case 'PreexistingResource':
    case 'MissingParameter':
    case 'BadRequestBody':
      return badRequest({ type: error.type, reason: error.message });
    default:
      (error/*: empty*/)
      return internalServerError(`The API has encountered an impossible error.`)
  }
};

module.exports = {
  MissingAuthenticationError,
  InvalidAuthenticationError,
  InvalidPermissionError,
  NonexistentResourceError,
  UnsupportedAuthorizationError,
  MissingParameterError,
  BadRequestBodyError,
  PreexistingResourceError,

  BadContentType,
  BadStructure,

  getResponseForError,
};