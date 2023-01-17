// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
*/
import { requestLinkGrant } from "@astral-atlas/sesame-components";
import { rootStyles, useAppSetup, useFadeTransition, useWildspaceController } from "@astral-atlas/wildspace-components";

import { h, useRef } from "@lukekaalim/act";
import { WildspaceGamePage } from "./game/GamePage";
import { WildspaceRoomPage } from "./room/WildspaceRoomPage.js";

export const App/*: Component<>*/ = () => {
  const setup = useAppSetup()
  const ref = useRef();
  const wildspace = useWildspaceController(setup, ref);
  if (!wildspace)
    return null;
  const { route } = wildspace.router;

  const anims = useFadeTransition(route, r => r.page, [route]);

  if (!wildspace.proof)
    return h('button', { onClick: async () => {
      const { proof } = await requestLinkGrant(new URL(`https://sesame.astral-atlas.com`))
      wildspace.setProof(proof);
    } }, 'Login plz');
  const { userId } = wildspace.proof;

  const pageElement = anims.map(({ key, value: route, anim: loadingAnim }) => {
    switch (route.page) {
      case 'game':
        return h(WildspaceGamePage, { key, route, wildspace, loadingAnim, userId });
      case 'room':
        return h(WildspaceRoomPage, { key, route, wildspace, loadingAnim, userId });
      default:
        return 'WHU'
    }
  })

  return h('div', { ref, className: rootStyles.root, tabIndex: 0 }, [
    pageElement,
  ]);
}

export const AuthorizedApp = () => {

}