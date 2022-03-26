// @flow strict
/*:: import type { Component } from "@lukekaalim/act"; */
import { EditorForm, EditorFormSubmit, EditorTextInput, FilesEditor } from "@astral-atlas/wildspace-components";
import { h, useState, useEffect } from "@lukekaalim/act";

export const TextEditorDemo/*: Component<>*/ = () => {
  const [text, setText] = useState('Example Text');
  const onTextChange = (newText) => {
    setText(newText);
  }
  return [
    h(EditorTextInput, { text, onTextChange, label: 'Text Editor Label' }),
    h('pre', {}, text),
  ];
}

export const FileEditorDemo/*: Component<>*/ = () => {
  const [file, setFile] = useState(null);
  const [objectURL, setObjectURL] = useState(null);
  const onFilesChange = (files) => {
    setFile(files[0]);
  }
  useEffect(() => {
    if (objectURL)
      URL.revokeObjectURL(objectURL);
    if (!file)
      setObjectURL(null);
    else
      setObjectURL(URL.createObjectURL(file));
  }, [file])
  return [
    h(FilesEditor, { onFilesChange, accept: 'image/*', label: 'Text Editor Label' }),
    objectURL && h('img', { src: objectURL, height: '240' })
  ];
}

export const EditorFormDemo/*: Component<>*/ = () => {
  const [submissionTime, setSubmissionTime] = useState(null);
  const onEditorSubmit = () => {
    setSubmissionTime(Date.now());
  }

  return [
    h(EditorForm, { onEditorSubmit, style: { resize: 'both', overflow: 'auto', padding: '8px', border: '1px solid black' } }, [
      h(EditorTextInput, { label: 'Sample Text' }),
      h(FilesEditor, { label: 'Sample File' }),
      h(EditorFormSubmit)
    ]),
    submissionTime && h('time', {}, [
      `Submitted: `,
      new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long' })
        .format(submissionTime)
    ]),
    h('div', { style: { height: '120px' }})
  ]
}