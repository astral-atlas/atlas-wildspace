// @flow strict

import { createContext, useEffect, useMemo, useState } from "@lukekaalim/act";
import { Vector2 } from "three";
import { createScheduleService } from "./scheduleController";
import { createRenderService } from "./renderService";

/*::
import type { ScheduleService } from "./scheduleController";
import type { RenderService } from "./renderService";
import type { Context } from "@lukekaalim/act";

export type WildspaceClientServices = {
  schedule: ScheduleService,
  render: RenderService,
}
*/

const defaultSchedule = createScheduleService();
const defaultRender = createRenderService({ iconSize: new Vector2(128, 128), schedule: defaultSchedule });

export const wildspaceServiceContext/*: Context<WildspaceClientServices>*/ = createContext({
  schedule: defaultSchedule,
  render: defaultRender
});

export const useWildspaceClientServices = ()/*: WildspaceClientServices*/ => {
  const [controller] = useState/*:: <WildspaceClientServices>*/(() => {
    const schedule = createScheduleService();
    const render = createRenderService({ schedule, iconSize: new Vector2(128, 128) });
    return { schedule, render };
  });
  useEffect(() => {
    const runSchedule = (idle) => {
      controller.schedule.startWork(() => idle.timeRemaining());
      id = requestIdleCallback(runSchedule);
    }
    let id = requestIdleCallback(runSchedule, { timeout: 200 });
    return () => cancelIdleCallback(id);
  }, [])
  
  return controller;
}