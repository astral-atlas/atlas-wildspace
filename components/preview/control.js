// @flow strict
/*:: import type { Component, SetValue, ElementNode } from '@lukekaalim/act'; */
import { h, useState } from '@lukekaalim/act';

/*::
export type TabbedPreviewControlPaneProps = {|
  tabs: ({
    name: string,
    controls: ElementNode[]
  })[]
|};
*/

export const TabbedPreviewControlPane/*: Component<TabbedPreviewControlPaneProps>*/ = ({ tabs }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const activeTab = tabs[activeTabIndex];

  return [
    h('menu', { key: 'menu', style: { listStyle: 'none', padding: 0, margin: 0, backgroundColor: '#8d9097', display: 'flex', flexDirection: 'row' }}, [
      ...tabs.map((tab, i) => h('li', {},
        h('button', {
          style: {
            padding: '12px 18px 12px 18px',
            borderWidth: '2px 2px 0 2px',
            backgroundColor: i !== activeTabIndex ? 'rgb(218, 219, 223)' : 'white',
          },
          disabled: i === activeTabIndex,
          onClick: () => setActiveTabIndex(i)
        }, tab.name)))
    ]),
    h('div', { key: activeTabIndex.toString() }, activeTab.controls),
  ];
};