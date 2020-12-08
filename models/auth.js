// @flow strict
/*:: import type { UUID } from './id'; */
/*:: import type { User, UserReference } from './users'; */
const { toObject, toString, toNumber, toConstant, toEnum } = require("./casting");
const { toUser, toUserReference } = require("./users");

/*::
export type AuthenticationRequest = {
  type: 'request-authentication',
  user: UserReference,
  secret: string,
};
export type AuthenticationGrant = {
  type: 'grant-authentication',
  user: User,
};
export type AuthenticationDeny = {
  type: 'deny-authentication',
  user: UserReference,
};
export type AuthenticationResponse =
  | AuthenticationGrant
  | AuthenticationDeny;
*/

const toAuthenticationRequest = (value/*: mixed*/)/*: AuthenticationRequest*/ => {
  const object = toObject(value);
  return {
    type: toConstant(object.type, 'request-authentication'),
    user: toUserReference(object.user),
    secret: toString(object.secret),
  };
};

const toAuthenticationGrant = (value/*: mixed*/)/*: AuthenticationGrant*/ => {
  const object = toObject(value);
  return {
    type: toConstant(object.type, 'grant-authentication'),
    user: toUser(object.user),
  };
};

const toAuthenticationDeny = (value/*: mixed*/)/*: AuthenticationDeny*/ => {
  const object = toObject(value);
  return {
    type: toConstant(object.type, 'deny-authentication'),
    user: toUserReference(object.user),
  };
};

const toAuthenticationResponse = (value/*: mixed*/)/*: AuthenticationResponse*/ => {
  const object = toObject(value);
  switch (object.type) {
    case 'deny-authentication':
      return toAuthenticationDeny(object);
    case 'grant-authentication':
      return toAuthenticationGrant(object);
    default:
      throw new TypeError();
  }
};

const withAuthenticationRequests = /*::<T>*/(value/*: mixed*/, toEvent/*: mixed => T*/)/*: T | AuthenticationRequest*/ => {
  const object = toObject(value);
  switch (object.type) {
    case 'request-authentication':
      return toAuthenticationRequest(object);
    default:
      return toEvent(object);
  }
};
const withAuthenticationGrants = /*::<T>*/(value/*: mixed*/, toEvent/*: mixed => T*/)/*: T | AuthenticationGrant | AuthenticationDeny*/ => {
  const object = toObject(value);
  switch (object.type) {
    case 'deny-authentication':
      return toAuthenticationDeny(object);
    case 'grant-authentication':
      return toAuthenticationGrant(object);
    default:
      return toEvent(object);
  }
};

module.exports = {
  toAuthenticationGrant,
  toAuthenticationRequest,
  toAuthenticationResponse,
  withAuthenticationRequests,
  withAuthenticationGrants,
}