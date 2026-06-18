import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import SimpleTextField from "./RichTextTextFieldComponent";

const TextFieldReact = Node.create({
  name: "TextFieldReactComponent",
  inline: true,
  group: "inline",

  addAttributes() {
    return {
      label: {
        default: null,
      },
      placeholder: {
        default: null,
      },
      explanation: {
        default: null,
      },
      answer: {
        default: null,
      },
      unit: {
        default: null,
      },
      value: {
        default: null,
      },
      isCorrect: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "rich-text-text-field-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return ["rich-text-text-field-component", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    // return ReactNodeViewRenderer(SimpleKatex, { contentDOMElementTag: 'span' });
    return ReactNodeViewRenderer(SimpleTextField);
  },
});

export default TextFieldReact;
