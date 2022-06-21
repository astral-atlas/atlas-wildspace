// @flow strict
/*::
import type { RoomController } from "../useRoomController";
import type { Component } from "@lukekaalim/act";
*/
import { WildspaceScene } from "../../WildspaceScene";
import { h } from "@lukekaalim/act";

/*::
export type RoomSceneScreenProps = {
  roomController: RoomController
}
*/

export const RoomSceneScreen/*: Component<RoomSceneScreenProps>*/ = ({ roomController }) => {
  return h(WildspaceScene, { roomController, attachementRef: roomController.roomBackgroundRef });
}