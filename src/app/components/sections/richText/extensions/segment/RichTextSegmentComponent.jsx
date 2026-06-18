import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { useState, useCallback, useRef, useEffect } from "react";
import ttsManager from "@/app/utils/TextToSpeechManager";

const SimpleSegment = ({ node }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const contentRef = useRef(null);
  const wrapperRef = useRef(null);

  const extractSegmentText = useCallback(() => {
    if (!node) return "";

    const mathMap = {
      "\\times": "times",
      "\\div": "divided by",
      "\\pm": "plus or minus",
      "\\leq": "is less than or equal to",
      "\\geq": "is greater than or equal to",
      "\\neq": "is not equal to",
      "\\approx": "is approximately",
      "\\degree": "degrees",
      "\\angle": "angle",
      "\\parallel": "is parallel to",
      "\\perp": "is perpendicular to",
    };

    const processNode = (n, index, siblings) => {
      if (!n) return "";

      if (n.type === "text") {
        let text = n.text || "";
        // Clean up common math symbols and underscores in raw text
        text = text
          .replace(/×/g, " times ")
          .replace(/÷/g, " divided by ")
          .replace(/\+/g, " plus ")
          .replace(/-/g, " minus ")
          .replace(/=/g, " equals ")
          .replace(/_+/g, " what "); // Read answer placeholders as "what"
        return text;
      }

      if (n.type === "KatexReactComponent") {
        let math = n.attrs?.originalString || "";
        // Basic LaTeX cleaning for speech
        Object.entries(mathMap).forEach(([key, value]) => {
          math = math.split(key).join(` ${value} `);
        });

        // Handle fractions \frac{num}{den} -> "num over den"
        math = math.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1 over $2");

        // Clean remaining backslashes and braces
        return math.replace(/[\\{}]/g, " ").trim();
      }

      if (
        n.type === "TextFieldReactComponent" ||
        n.type === "DropdownReactComponent" ||
        n.type === "fractionField"
      ) {
        // Skip answer placeholders entirely - don't read them aloud
        // Students will see the visual placeholder and know where to answer
        return "";
      }

      // Structural nodes (paragraph, heading, etc.)
      if (n.content && Array.isArray(n.content)) {
        return (
          n.content
            .map((child, i, arr) => processNode(child, i, arr))
            .join("") + " "
        );
      }

      return "";
    };

    // Convert ProseMirror node to JSON to match our recursive structure
    return processNode(node.toJSON()).replace(/\s+/g, " ").trim();
  }, [node]);

  const handleSpeakerClick = useCallback(
    (e) => {
      e.stopPropagation();

      if (!ttsManager.isSupported()) {
        console.log("TTS not supported");
        return;
      }

      const text = extractSegmentText();
      console.log("Extracted text:", text);

      if (!text) {
        console.log("No text found");
        return;
      }

      if (isSpeaking) {
        ttsManager.stop();
        setIsSpeaking(false);
      } else {
        // Stop any currently playing audio
        ttsManager.stop();

        // Set up state change callback
        ttsManager.setStateChangeCallback(({ speaking }) => {
          setIsSpeaking(speaking);
        });

        // Speak the text
        console.log("Speaking text:", text);
        ttsManager.speak(text);
        setIsSpeaking(true);
      }
    },
    [isSpeaking, extractSegmentText],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        ttsManager.stop();
      }
    };
  }, [isSpeaking]);

  // Log ref status
  useEffect(() => {
    if (contentRef.current) {
      console.log("contentRef ready");
    }
  }, []);

  // Inject pulse and sound wave animations
  useEffect(() => {
    const styleId = "speaker-animations";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes speaker-pulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(88, 204, 2, 0.4), 0 0 0 3px rgba(88, 204, 2, 0.1);
          }
          50% {
            box-shadow: 0 4px 16px rgba(88, 204, 2, 0.6), 0 0 0 5px rgba(88, 204, 2, 0.2);
          }
        }
        @keyframes sound-wave-1 {
          0%, 100% {
            opacity: 0.6;
            transform: translateX(0);
          }
          50% {
            opacity: 1;
            transform: translateX(2px);
          }
        }
        @keyframes sound-wave-2 {
          0%, 100% {
            opacity: 0.6;
            transform: translateX(0);
          }
          50% {
            opacity: 1;
            transform: translateX(3px);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <NodeViewWrapper
      className="rich-text-segment-component"
      as="div"
      style={{ position: "relative" }}
      ref={wrapperRef}
    >
      {ttsManager.isSupported() && (
        <div
          className="segment-speaker-icon"
          onClick={handleSpeakerClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
          }}
          style={{
            position: "absolute",
            top: "8px",
            right: "20px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            backgroundColor: isSpeaking ? "#58CC02" : "#00CDD2",
            borderRadius: "50%",
            boxShadow: isSpeaking
              ? "0 4px 12px rgba(88, 204, 2, 0.4), 0 0 0 3px rgba(88, 204, 2, 0.1)"
              : "0 4px 12px rgba(0, 205, 210, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.8)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 10,
            fontSize: "20px",
            userSelect: "none",
            transform: "scale(1)",
            animation: isSpeaking
              ? "speaker-pulse 1.5s ease-in-out infinite"
              : "none",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transition: "transform 0.2s ease",
            }}
          >
            {isSpeaking ? (
              // Speaking icon with sound waves
              <>
                <path
                  d="M12 4L7 9H3V15H7L12 20V4Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 10C16.5523 10 17 10.4477 17 11C17 11.5523 16.5523 12 16 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{
                    animation: "sound-wave-1 1s ease-in-out infinite",
                  }}
                />
                <path
                  d="M19 8C19.5523 8 20 8.44772 20 9C20 9.55228 19.5523 10 19 10"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{
                    animation: "sound-wave-2 1s ease-in-out infinite",
                  }}
                />
                <path
                  d="M19 14C19.5523 14 20 14.4477 20 15C20 15.5523 19.5523 16 19 16"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{
                    animation: "sound-wave-2 1s ease-in-out infinite 0.3s",
                  }}
                />
              </>
            ) : (
              // Muted icon (speaker with X)
              <>
                <path
                  d="M12 4L7 9H3V15H7L12 20V4Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 9L21 13M21 9L17 13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </div>
      )}
      <div ref={contentRef} style={{ paddingRight: "60px" }}>
        <NodeViewContent className="card" />
      </div>
    </NodeViewWrapper>
  );
};

export default SimpleSegment;
