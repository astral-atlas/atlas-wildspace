// @flow strict
/*:: import type { AuthService } from './services/auth'; */
const { createAuthService } = require('./services/auth');

/*::
type Services = {
  auth: AuthService,
};
export type {
  AuthService,
  Services,
};
*/

const createServices = ()/*: Services*/ => {
  const auth = createAuthService();

  return {
    auth,
  };
}

module.exports = {
  createServices,
};
