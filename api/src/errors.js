// @flow strict
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
class MissingParameterError extends Error {
  type/*: 'MissingParameter'*/ = 'MissingParameter'

  constructor(parameter/*: string*/) {
    super(`The request is missing a required parameter, ${parameter}`);
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

export type {
  APIError,
  MissingAuthenticationError,
  InvalidAuthenticationError,
  InvalidPermissionError,
  NonexistentResourceError,
  UnsupportedAuthorizationError,
  MissingParameterError
};
*/

const getResponseForError = (error/*: APIError*/) => {
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
    case 'MissingParameter':
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

  getResponseForError,
};