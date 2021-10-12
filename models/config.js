// @flow strict
/*:: import type { ServiceProof } from "@astral-atlas/sesame-models"; */
/*:: import type { Cast } from "@lukekaalim/cast"; */

import { castServiceProof } from "@astral-atlas/sesame-models";
import { castNumber, createObjectCaster, castString, c } from "@lukekaalim/cast";

/*::
export type DataConfig =
  | {| type: 'file', directory: string |}
  | {| type: 'memory' |}
  | {| type: 'awsS3', bucket: string, keyPrefix: string, region: string |}

export type APIConfig = {
  port: number,
  data: DataConfig,
  api: {
    sesame: {
      origin: string,
      proof: ServiceProof,
    }
  }
};
*/

export const castDataConfig/*: Cast<DataConfig>*/ = c.or('type', {
  'file': c.obj({ type: c.lit('file'), directory: c.str }),
  'awsS3': c.obj({ type: c.lit('awsS3'), bucket: c.str, keyPrefix: c.str, region: c.str }),
  'memory': c.obj({ type: c.lit('memory') }),
})

export const castAPIConfig/*: Cast<APIConfig>*/ = createObjectCaster({
  port: castNumber,
  data: castDataConfig,
  api: c.obj({
    sesame: c.obj({
      origin: c.str,
      proof: castServiceProof
    })
  })
});

/*::
export type WWWConfig = {
  www: {
    sesame: {
      httpOrigin: string,
    }
  },
  api: {
    sesame: {
      httpOrigin: string,
    },
    wildspace: {
      httpOrigin: string,
      wsOrigin: string,
    },
  },
};
*/

export const castWWWConfig/*: Cast<WWWConfig>*/ = c.obj({
  www: c.obj({
    sesame: c.obj({
      httpOrigin: c.str
    }),
  }),
  api: c.obj({
    wildspace: c.obj({
      httpOrigin: c.str,
      wsOrigin: c.str,
    }),
    sesame: c.obj({
      httpOrigin: c.str,
    })
  }),
});
