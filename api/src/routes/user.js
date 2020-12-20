// @flow strict
/*:: import type { Services } from '../services'; */
/*:: import type { Route, RestOptions } from '@lukekaalim/server'; */
const { resource, json: { ok } } = require("@lukekaalim/server");
const { withErrorHandling } = require("./utils");

const createUserRoutes = (services/*: Services*/, options/*: RestOptions*/)/*: Route[]*/ => {
  const readSelf = async ({ auth }) => {
    const user = await services.auth.getUser(auth);
    return ok(user);
  };

  const selfResource = resource('/users/self', {
    get: withErrorHandling(readSelf)
  }, options);

  return [
    ...selfResource,
  ];
};

module.exports = {
  createUserRoutes,
};