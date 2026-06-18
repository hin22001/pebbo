import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import SimpleDropdown from "./RichTextDropdownComponent";

const DropdownReact = Node.create({
  name: "DropdownReactComponent",
  group: "inline",
  inline: true,

  parseHTML() {
    return [
      {
        tag: "rich-text-dropdown-component",
      },
    ];
  },

  addAttributes() {
    return {
      options: {
        default: null,
      },
      label: {
        default: null,
      },
      placeholder: {
        default: null,
      },
      explanation: {
        default: null,
      },
      answers: {
        default: null,
      },
      unit: {
        default: null,
      },
      value: {
        default: null,
      },
      multiple: {
        default: null,
      },
      isCorrect: {
        default: null,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["rich-text-dropdown-component", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SimpleDropdown);
  },
});

export default DropdownReact;
