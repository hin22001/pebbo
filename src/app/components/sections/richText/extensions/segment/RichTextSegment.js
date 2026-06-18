import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import SimpleSegment from "./RichTextSegmentComponent";

const SegmentReact = Node.create({
  name: "SegmentReactComponent",
  group: "block",
  content: "block*",

  parseHTML() {
    return [
      {
        tag: "rich-text-segment-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["rich-text-segment-component", mergeAttributes(HTMLAttributes), 0];
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => {
        return this.editor
          .chain()
          .insertContentAt(this.editor.state.selection.head, {
            type: this.type.name,
          })
          .focus()
          .run();
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(SimpleSegment);
  },
});

export default SegmentReact;
