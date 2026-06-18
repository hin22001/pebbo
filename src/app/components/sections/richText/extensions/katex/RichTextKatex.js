import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import RichTextKatexComponent from "./RichTextKatexComponent";

const KatexReact = Node.create({
  name: "KatexReactComponent",
  // group: 'block',
  // group: 'inline*',
  inline: true,
  group: "inline",

  addAttributes() {
    return {
      originalString: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "katex-react",
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return ["katex-react", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    // return ReactNodeViewRenderer(SimpleKatex, { contentDOMElementTag: 'span' });
    return ReactNodeViewRenderer(RichTextKatexComponent);
  },
});

export default KatexReact;
