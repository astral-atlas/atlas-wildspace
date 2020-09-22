// @flow strict

const toBase64 = (input/*: string*/) => {
  if (Buffer)
    return Buffer.from(input, 'utf8').toString('base64');
  if (btoa)
    return btoa(input);
  throw new Error(`No method on this platform to encode base64 encoded string`);
};

const fromBase64 = (input/*: string*/) => {
  if (Buffer)
    return Buffer.from(input, 'base64').toString('utf8');
  if (atob)
    return atob(input);
  throw new Error(`No method on this platform to decode base64 encoded string`);
};

module.exports = {
  toBase64,
  fromBase64,
};
