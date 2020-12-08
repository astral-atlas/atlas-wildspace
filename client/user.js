// @flow strict
/*:: import type { User } from '@astral-atlas/wildspace-models'; */
/*:: import type { RESTClient } from './rest'; */
const { UnexpectedResponseError } = require('./rest');
const { toUser } = require("@astral-atlas/wildspace-models");

/*::
type SelfDetails =
  | { type: 'logged-in', user: User }
  | { type: 'invalid-user' }

type UserClient = {
  getSelf: () => Promise<SelfDetails>,
};

export type {
  UserClient,
  SelfDetails,
};
*/

const createUserClient = (rest/*: RESTClient*/)/*: UserClient*/ => {
  const getSelf = async () => {
    try {
      const { content } = await rest.get({ resource: '/users/self' });
      const user = toUser(content);
      return { type: 'logged-in', user };
    } catch (error) {
      if (error instanceof UnexpectedResponseError) {
        const responseError = (error/*: UnexpectedResponseError*/);
        if (responseError.response.status === 401)
          return { type: 'invalid-user' };
      }
      throw error;
    }
  };

  return {
    getSelf,
  };
};

module.exports = {
  createUserClient,
};
