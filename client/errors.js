// @flow strict
/*:: import type { HTTPResponse } from '@lukekaalim/http-client'; */
/*:: import type { ErrorResponseBody } from '@astral-atlas/wildspace-models'; */
const { StructError, coerce } = require('superstruct');
const { parse } = require('./json');
const { error } = require('./structs');

const getError = (response) => {
  try {
    const value = parse(response.body);
    return (coerce(value, error)/*: ErrorResponseBody*/);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        type: 'Unknown',
        reason: 'response body contained invalid JSON'
      };
    }
    if (error instanceof StructError) {
      return {
        type: 'Unknown',
        reason: 'response body does not match expected error response'
      };
    }
    console.log(error.constructor);
    throw error;
  }
}

class UnexpectedResponseError extends Error {  
  /*:: type: 'UnexpectedResponse'; */

  /*:: status: number; */
  /*:: responseErrorType: string; */
  /*:: response: HTTPResponse; */
  /*:: reason: string; */

  constructor(response/*: HTTPResponse*/) {
    const { reason, type } = getError(response);
    super(reason);
    this.type = 'UnexpectedResponse';
    this.reason = reason;
    this.response = response;
    this.responseErrorType = type;
  }
};

module.exports = {
  UnexpectedResponseError,
};
