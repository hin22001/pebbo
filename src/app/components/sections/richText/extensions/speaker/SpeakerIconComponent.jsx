import { NodeViewWrapper } from "@tiptap/react";
import React from "react";
import ttsManager from "@/app/utils/TextToSpeechManager";

const SpeakerIconComponent = (props) => {
  const { node } = props;
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const text = node?.attrs?.text || "";
  const paragraphId = node?.attrs?.paragraphId || "";

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!text) {
      console.warn("No text to speak");
      return;
    }

    if (isSpeaking) {
      // Stop speaking
      ttsManager.stop();
      setIsSpeaking(false);
    } else {
      // Stop any other speaking
      ttsManager.stop();

      // Set up state change callback
      ttsManager.setStateChangeCallback(({ speaking }) => {
        setIsSpeaking(speaking);
      });

      // Start speaking
      ttsManager.speak(text);
      setIsSpeaking(true);
    }
  };

  // Only show if TTS is supported
  if (!ttsManager.isSupported()) {
    return (
      <NodeViewWrapper
        as="span"
        className="rich-text-speaker-icon"
        contentEditable={false}
        data-drag-handle=""
        style={{
          display: "inline !important",
          marginLeft: "8px",
          verticalAlign: "baseline",
          cursor: "not-allowed",
          opacity: 0.5,
          fontSize: "18px",
          zIndex: 100,
          position: "relative",
          backgroundColor: "rgba(0, 205, 210, 0.1)", // Light background for visibility
          padding: "2px 4px",
          borderRadius: "4px",
          border: "1px solid #00CDD2", // Border for visibility
          whiteSpace: "nowrap",
          lineHeight: "1",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "22px",
            height: "22px",
            textAlign: "center",
          }}
        >
          {/* 🔇 */}
        </span>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      as="span"
      className="rich-text-speaker-icon"
      contentEditable={false}
      data-drag-handle=""
      style={{
        display: "inline !important",
        marginLeft: "8px",
        verticalAlign: "baseline",
        cursor: "pointer",
        transition: "transform 0.2s ease",
        userSelect: "none",
        backgroundColor: "rgba(0, 205, 210, 0.1)", // Light background for visibility
        padding: "2px 4px",
        borderRadius: "4px",
        border: "1px solid #00CDD2", // Border for visibility
        fontSize: "18px",
        zIndex: 100,
        position: "relative",
        whiteSpace: "nowrap",
        lineHeight: "1",
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <span
        style={{
          pointerEvents: "auto",
          display: "inline-block",
          width: "22px",
          height: "22px",
          textAlign: "center",
        }}
      >
        {/* {isSpeaking ? "🔊" : "🔇"} */}
      </span>
    </NodeViewWrapper>
  );
};

export default SpeakerIconComponent;
