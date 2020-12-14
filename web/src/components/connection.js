// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { Connection } from '@astral-atlas/wildspace-client'; */
/*:: import type { StyleSheet } from '../lib/style'; */
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useConnection } from '../hooks/useAsync';
import { cssClass, cssStylesheet } from '../lib/style';

const recievedList = cssClass('admin-connection-received-list', {

});
const eventForm = cssClass('admin-connection-event-form', {
  
});

export const connectionAdminSheet/*: StyleSheet*/ = cssStylesheet([
  recievedList,
]);

const ConnectionEventForm = ({ eventName, eventProps, onSubmitEvent }) => {
  const [event, setEvent] = useState(Object.fromEntries(Object
    .entries(eventProps)
    .filter(([name, { type }]) => type === 'literal')
    .map(([name, { value }]) => [name, value])
  ));

  const onNumberInput = (propName) => (e) => {
    setEvent({ ...event, [propName]: parseFloat(e.currentTarget.value) })
  }
  const onTextInput = (propName) => (e) => {
    setEvent({ ...event, [propName]: e.currentTarget.value })
  }
  const onSubmit = (e) => {
    e.preventDefault();
    onSubmitEvent(event);
  };

  return h('form', { onSubmit: onSubmit }, [
    h('caption', {}, eventName),
    ...Object.entries(eventProps).map(([propName, propType]) => {
      switch (propType.type) {
        case 'number':
          return h('label', {}, [propName,
            h('input', { type: 'number', value: event[propName], onInput: onNumberInput(propName) })]);
        case 'text':
          return h('label', {}, [propName,
            h('input', { type: 'text', value: event[propName], onInput: onTextInput(propName) })]);
      }
    }),
    h('input', { type: 'submit' }, `Send`)
  ]);
};

/*::
export type ConnectionAdminProps<ServerEvent, ClientEvent> = {
  connection: ?Connection<ServerEvent, ClientEvent>,
  eventTypes: {
    [eventName: string]: {
      [propertyName: string]:
        | { type: 'literal', value: mixed }
        | { type: 'text' }
        | { type: 'number' }
    },
  },
  toEvent: mixed => ClientEvent,
};
*/

export const ConnectionAdmin = /*::<S, C>*/({ connection, eventTypes, toEvent }/*: ConnectionAdminProps<S, C>*/)/*: Node*/ => {
  const [recievedEvents, send] = useConnection(connection, (s, e) => [...s, e], [], [eventTypes]);

  const onSubmitEvent = (event) => {
    send(toEvent(event));
  };

  return h('section', {}, [
    h('section', {}, [
      ...Object.entries(eventTypes).map(([eventName, eventProps]) =>
        h(ConnectionEventForm, { eventName, eventProps, onSubmitEvent }))
    ]),
    h('ol', { class: 'admin-connection-received-list' }, [
      ...recievedEvents.map(event => 
        h('li', {}, h('pre', {}, JSON.stringify(event, null, 2))))
    ]),
  ]);
};
