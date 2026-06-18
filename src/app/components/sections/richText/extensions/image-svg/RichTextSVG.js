import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import SimpleSvg from "./RichTextSVGComponent";

const SvgReact = Node.create({
  name: "SvgReactComponent",
  group: "inline",
  inline: true,

  addAttributes() {
    return {
      data: {
        default: "",
      },
      size: {
        default: "md",
      },
      customSize: {
        default: "",
      },
      imageUrl: {
        default: "",
      },
      image_approved: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "svg-react",
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return ["svg-react", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    // return ReactNodeViewRenderer(SimpleKatex, { contentDOMElementTag: 'span' });
    return ReactNodeViewRenderer(SimpleSvg);
  },
});

export default SvgReact;
