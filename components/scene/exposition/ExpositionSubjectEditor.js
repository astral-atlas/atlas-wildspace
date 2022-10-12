// @flow strict

import { emptyRootNode, proseNodeJSONSerializer } from "@astral-atlas/wildspace-models";
import { h } from "@lukekaalim/act";
import { RichTextSimpleEditor } from "../../richText";
import { EditorTextInput, SelectEditor } from "../../editor/form";


/*::
import type { ExpositionSubject } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";

export type ExpositionSubjectEditorProps = {
  subject: ExpositionSubject,
  onSubjectChange: ExpositionSubject => mixed,
}
*/

export const ExpositionSubjectEditor/*: Component<ExpositionSubjectEditorProps>*/ = ({
  subject,
  onSubjectChange
}) => {
  return [
    h(ExpositionSubjectTypeEditor, { subject, onSubjectChange }),
    h(ExpositionSubjectContentEditor, { subject, onSubjectChange }),
  ]
};

const ExpositionSubjectTypeEditor = ({
  subject,
  onSubjectChange
}) => {
  const getDefaultSubjectForType = (type) => {
    switch (type) {
      case 'title':
        return { type: 'title', title: '', subtitle: emptyRootNode.toJSON() };
      case 'caption':
        return { type: 'caption', caption: emptyRootNode.toJSON() };
      case 'annotation':
        return { type: 'annotation', annotation: emptyRootNode.toJSON() };
      case 'description':
        return { type: 'description', description: emptyRootNode.toJSON() };
      default:
        return { type: 'none' };
    }
  }
  const onSelectedChange = (type) => {
    onSubjectChange(getDefaultSubjectForType(type));
  }
  return h(SelectEditor, {
    label: 'Subject Type',
    values: [
      { value: 'title' },
      { value: 'caption' },
      { value: 'annotation' },
      { value: 'description' },
      { value: 'none' },
    ],
    selected: subject.type,
    onSelectedChange,
  });
}
const ExpositionSubjectContentEditor = ({ subject, onSubjectChange }) => {
  console.log(subject)
  switch (subject.type) {
    case 'title':
      return h(TitleEditor, { subject, onSubjectChange });
    case 'annotation':
      return h(AnnotationEditor, { subject, onSubjectChange });
    case 'caption':
      return h(CaptionEditor, { subject, onSubjectChange });
    case 'description':
      return h(DescriptionEditor, { subject, onSubjectChange });
    default:
      return null;
  }
}

const TitleEditor = ({ subject, onSubjectChange }) => {
  const onTitleChange = title => onSubjectChange({
    ...subject,
    title,
  })
  const onSubtitleChange = node => onSubjectChange({
    ...subject,
    subtitle: node.toJSON(),
  })
  return [
    h(EditorTextInput, {
      label: 'Title',
      text: subject.title,
      onTextChange: onTitleChange,
    }),
    h('label', {}, [
      h('span', {}, 'Subtitle'),
    ]),
    h(RichTextSimpleEditor, {
      node: proseNodeJSONSerializer.deserialize(subject.subtitle),
      onNodeChange: onSubtitleChange,
    })
  ];
}

const AnnotationEditor = ({ subject, onSubjectChange }) => {
  const onAnnotationChange = annotation => onSubjectChange({
    ...subject,
    annotation: annotation.toJSON(),
  })
  return [
    h('label', {}, [
      h('span', {}, 'Annotation'),
    ]),
    h(RichTextSimpleEditor, {
      node: proseNodeJSONSerializer.deserialize(subject.annotation),
      onNodeChange: onAnnotationChange,
    })
  ];
}

const DescriptionEditor = ({ subject, onSubjectChange }) => {
  const onDescriptionChange = description => onSubjectChange({
    ...subject,
    description: description.toJSON(),
  })
  return [
    h('label', {}, [
      h('span', {}, 'Description'),
    ]),
    h(RichTextSimpleEditor, {
      node: proseNodeJSONSerializer.deserialize(subject.description),
      onNodeChange: onDescriptionChange,
    })
  ];
}

const CaptionEditor = ({ subject, onSubjectChange }) => {
  const onCaptionChange = caption => onSubjectChange({
    ...subject,
    caption: caption.toJSON(),
  })
  return [
    h('label', {}, [
      h('span', {}, 'Caption'),
    ]),
    h(RichTextSimpleEditor, {
      node: proseNodeJSONSerializer.deserialize(subject.caption),
      onNodeChange: onCaptionChange,
    })
  ];
}