// @flow strict
/*:: import type { AccessOptions, CacheOptions } from '@lukekaalim/http-server'; */

export const defaultOptions/*: {| access?: AccessOptions, cache?: CacheOptions |} */ = {
  access: {
    origins: { type: 'wildcard' },
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    cache: 500,
    headers: ['content-type', 'authorization']
  },
};