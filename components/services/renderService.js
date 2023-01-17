// @flow strict
/*::
import type { ScheduleService } from "./scheduleController";
import type { Camera, Scene, Vector2 } from "three";
*/
import { WebGLRenderer } from "three";
import { createSchedulerCancelSignaller } from "./scheduleController";

/*::
export type RenderServiceParams = {
  iconSize: Vector2,

  schedule: ScheduleService
};
export type IconResult = {
  url: string,
  blob: Blob,
  dispose: () => void
}
export type RenderService = {
  renderIcon: (scene: Scene, camera: Camera) => { promise: Promise<IconResult>, cancel: () => void },
};
*/
export const createRenderService = ({
  iconSize,
  schedule
}/*: RenderServiceParams*/)/*: RenderService*/ => {
  const canvas = document.createElement('canvas');
  const iconRenderer = new WebGLRenderer({ canvas });
  iconRenderer.setSize(iconSize.x, iconSize.y, false);

  const renderIcon = (scene, camera) => {
    const singaller = createSchedulerCancelSignaller();
    const promise = new Promise(resolve => {
      const work = function*() {
        iconRenderer.render(scene, camera, null, true);
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          let disposed = false;
          const dispose = () => {
            if (!disposed)
              URL.revokeObjectURL(url);
            disposed = true;
          }
          singaller.addCancelListener(() => {
            dispose();
          });
          resolve({
            url,
            blob,
            dispose,
          });
        }, 'image/webp', 0.25)
      }
      schedule.enqueueWork(work(), singaller);
    });

    return {
      promise,
      cancel: singaller.cancel,
    };
}

  return { renderIcon };
};