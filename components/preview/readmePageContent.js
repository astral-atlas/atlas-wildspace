// @flow strict
/*:: import type { Component } from "@lukekaalim/act"; */

import { h } from "@lukekaalim/act";
import { MarkdownRenderer, RemoteMarkdownRenderer } from "./markdown";

import previewStyles from './previewStyles.module.css';

export const ReadmePageContent/*: Component<{ url?: string, text?: string }> */ = ({ url, text }) => {
  return h('section', { className: previewStyles.readmePageContent }, [
    url && h(RemoteMarkdownRenderer, { markdownURL: url }) || null,
    text && h(MarkdownRenderer, { markdownText: text }) || null
  ])
};