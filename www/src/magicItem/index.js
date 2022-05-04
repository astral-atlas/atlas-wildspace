// @flow strict

import { MagicItemCard, useAsync } from "@astral-atlas/wildspace-components";
import { h } from "@lukekaalim/act";

/*::
import type { Component } from "@lukekaalim/act/component";
*/
import { useURLParam } from "../../hooks/navigation";
import { useAPI } from "../../hooks/api";

export const MagicItemPage/*: Component<>*/ = () => {
  const [gameId] = useURLParam('gameId');
  const [magicItemId] = useURLParam('magicItemId');

  const api = useAPI()
  if (!gameId || !magicItemId)
    return '404';

  const [magicItems] = useAsync(async () => api.game.magicItem.list(gameId), [gameId, magicItemId])

  if (!magicItems)
    return 'Loading';

  const selectedMagicItem = magicItems.find(m => m.id === magicItemId)

  if (!selectedMagicItem)
    return 'No Item';

  return [
    h(MagicItemCard, { magicItem: selectedMagicItem })
  ];
}