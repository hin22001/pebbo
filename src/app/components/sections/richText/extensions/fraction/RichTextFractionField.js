import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import FractionField from "./RichTextFractionComponent";

const TextFieldReact = Node.create({
  name: "FractionReactComponent",
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
        tag: "rich-text-fraction-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return ["rich-text-fraction-component", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    // return ReactNodeViewRenderer(SimpleKatex, { contentDOMElementTag: 'span' });
    return ReactNodeViewRenderer(FractionField);
  },
});

export default TextFieldReact;
