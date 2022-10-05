// @flow strict
/*::
import type { Page } from "..";
import type { AssetID, AssetInfo } from "@astral-atlas/wildspace-models";
*/

import { ExpositionEditor } from "@astral-atlas/wildspace-components";
import { h, useState } from "@lukekaalim/act";
import { WidePage } from "../page";
import { createMockLibraryData, createMockWildspaceClient, createWebAssetMock } from "@astral-atlas/wildspace-test";
import { emptyRootNode } from "@astral-atlas/wildspace-models";
import { ScaledLayoutDemo } from "../demo";

const ExpositionEditorDemo = () => {
  const [library] = useState(createMockLibraryData())
  const [assets, setAssets] = useState([
    ...library.assets
  ])
  const assetMap = new Map/*:: <AssetID, ?AssetInfo>*/(assets.map(a => [a.description.id, a]));

  const client = createMockWildspaceClient();
  client.asset = createWebAssetMock(assetMap, a => {
    setAssets([...assets, a])
  })

  const [exposition, setExposition] = useState({
    description: { rootNode: emptyRootNode.toJSON(), version: 0 },
    background: {
      type: 'mini-theater',
      miniTheaterId: library.miniTheaters[0].id,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 0 },
    },
    subject: { type: 'none' }
  })
  const onExpositionChange = (e) => {
    setExposition(e)
  }

  return [
    h(ScaledLayoutDemo, {}, [
      h(ExpositionEditor, {
        client,
        assets: assetMap,
        exposition,
        library,
        onExpositionChange
      })
    ]),
    h('code', {}, h('pre', {}, [
      JSON.stringify(exposition, null, 2)
    ]))
  ]
}

export const expositionEditorPage/*: Page*/ = {
  link: { children: [], href: '/scenes/exposition/editor', name: 'Exposition Editor' },
  content: h(WidePage, {}, h(ExpositionEditorDemo))
}

