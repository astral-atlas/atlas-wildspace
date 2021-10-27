// @flow strict
/*:: import type { Component, Context, SetValue, ElementNode } from '@lukekaalim/act'; */
import { h, createContext, useContext, useState } from "@lukekaalim/act";

import toolStyles from './tools.module.css';

/*::
export type TabbedToolboxProps = {
  tabs: { [string]: ElementNode }
};
*/

export const TabbedToolbox/*: Component<TabbedToolboxProps>*/ = ({ tabs }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabEntries/*: [string, ElementNode][]*/ = (Object.entries(tabs)/*: any*/);

  const activeTab = activeTabIndex !== null && tabEntries[activeTabIndex];

  return [
    h('div', { className: toolStyles.tabbedToolbox }, [
      h('menu', {  }, [
        ...tabEntries.map(([tabName, tabContext], i) => h('li', {},
          h('button', {
            style: {
              padding: '12px 18px 12px 18px',
              borderWidth: '2px 2px 0 2px',
              backgroundColor: i !== activeTabIndex ? 'rgb(218, 219, 223)' : 'white',
            },
            disabled: i === activeTabIndex,
            onClick: () => setActiveTabIndex(i)
          }, tabName)))
      ]),
      activeTab && h('div', { key: activeTabIndex, className: toolStyles.content }, activeTab[1]),
    ]),
  ];
}
