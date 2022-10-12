// @flow strict
import { proseNodeJSONSerializer } from "@astral-atlas/wildspace-models";
import { h, useRef } from "@lukekaalim/act";
import { useBezierAnimation } from "@lukekaalim/act-curve";
import { RichTextReadonlyRenderer } from "../../richText";
import styles from './ExpositionSubjectRenderer.module.css';
import { useFadeTransition } from "../../transitions/useFadeTransition";

/*::
import type { Exposition, ExpositionSubject } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
*/

/*::
export type ExpositionSubjectRendererProps = {
  subject: ExpositionSubject
};
*/
export const ExpositionSubjectRenderer/*: Component<ExpositionSubjectRendererProps>*/ = ({
  subject
}) => {
  const anims = useFadeTransition(subject, s => s.type, [subject]);

  return anims.map(({ anim, key, value}) => {
    return h(ExpositionSubjectContent, {
      key,
      subject: value,
      anim,
    });
  })
}

const ExpositionSubjectContent = ({ subject, anim }) => {
  switch (subject.type) {
    case 'annotation':
      return h(Annotation, { subject, anim })
    case 'caption':
      return h(Caption, { subject, anim });
    case 'description':
      return h(Description, { subject, anim });
    case 'title':
      return h(Title, { subject, anim });
    default:
      return null;
  }
}

const Annotation = ({ subject, anim }) => {
  const ref = useRef();
  useBezierAnimation(anim, (point) => {
    if (ref.current)
      ref.current.style.opacity = point.position;
  })

  return h('div', { class: styles.annotation, ref }, [
    h('div', { class: styles.annotationContainer }, [
      h(RichTextReadonlyRenderer, {
        node: proseNodeJSONSerializer.deserialize(subject.annotation)
      })
    ])
  ]);
}
const Caption = ({ subject, anim }) => {
  const ref = useRef();
  useBezierAnimation(anim, (point) => {
    if (ref.current)
      ref.current.style.opacity = point.position;
  })

  return h('div', { class: styles.caption, ref }, [
    h(RichTextReadonlyRenderer, {
      node: proseNodeJSONSerializer.deserialize(subject.caption)
    })
  ]);
}
const Description = ({ subject, anim }) => {
  const ref = useRef();
  useBezierAnimation(anim, (point) => {
    if (ref.current)
      ref.current.style.opacity = point.position;
  })

  return h('div', { class: styles.description, ref }, [
    h(RichTextReadonlyRenderer, {
      node: proseNodeJSONSerializer.deserialize(subject.description)
    })
  ]);
}
const Title = ({ subject, anim }) => {
  const ref = useRef();
  useBezierAnimation(anim, (point) => {
    if (ref.current)
      ref.current.style.opacity = point.position;
  })

  return h('div', { class: styles.title, ref }, [
    h('div', { class: styles.titleContainer }, [
      h('h2', {}, subject.title),
      h(RichTextReadonlyRenderer, {
        node: proseNodeJSONSerializer.deserialize(subject.subtitle)
      })
    ]),
  ]);
}