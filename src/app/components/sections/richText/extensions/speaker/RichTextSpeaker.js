import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import SpeakerIconComponent from "./SpeakerIconComponent";

const RichTextSpeaker = Node.create({
  name: "speakerIcon",
  inline: true,
  group: "inline",
  atom: true, // Cannot have content inside

  addAttributes() {
    return {
      text: {
        default: "",
      },
      paragraphId: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "rich-text-speaker-icon",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        class: "rich-text-speaker-icon",
        style:
          "display: inline; margin-left: 8px; vertical-align: baseline; background-color: rgba(0, 205, 210, 0.1); padding: 2px 4px; border-radius: 4px; border: 1px solid #00CDD2; font-size: 18px; white-space: nowrap; line-height: 1;",
      },
      "🔊",
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SpeakerIconComponent);
  },
});

export default RichTextSpeaker;
