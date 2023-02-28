// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { ExpandToggleInput } from "@astral-atlas/wildspace-components";
import { h, useState } from "@lukekaalim/act";

export const ExpandToggleInputDemo/*: Component<>*/ = () => {
  const [expanded, setExpanded] = useState(true);

  return h('div', {}, [
    h(ExpandToggleInput, { expanded, onExpandedChange: setExpanded }),
  ]);
};
