// @flow strict
const s = require('@lukekaalim/schema');

const errorResponse = s.define('ErrorResponseBody', 'The BODY of an response from the API that indicates an error',
  s.object([
    ['reason', s.string()],
    ['type', s.string()],
  ]),
);

module.exports = {
  errorResponse,
};
