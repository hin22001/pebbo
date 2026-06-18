import { Stack } from "@mui/material";
import { NodeViewWrapper } from "@tiptap/react";

const SimpleSvg = ({ node }) => {
  const mainClassName = "section-rich-text-extensions-image-svg-component";

  const { imageUrl, data, size, customSize, image_approved } = node.attrs;
  const svgSize = size && size !== "null" ? size : "md";

  let parsedCustomSize = {};
  try {
    parsedCustomSize =
      typeof customSize === "string"
        ? JSON.parse(customSize || "{}")
        : customSize || {};
  } catch (e) {
    parsedCustomSize = {};
  }

  const isSizeDefined = Boolean(
    parsedCustomSize?.width ||
      parsedCustomSize?.height ||
      (size && size !== "null"),
  );

  const imageClassName = isSizeDefined
    ? `size-${svgSize}`
    : "image-fit-content";

  // Use the verified encoding method from admin panel: utf8 with encodeURIComponent
  const svgSrc = data
    ? `data:image/svg+xml;utf8,${encodeURIComponent(data)}`
    : "";

  /* Strict Approval Logic */
  const showPng = imageUrl && image_approved;

  return (
    <NodeViewWrapper as="div">
      <Stack className={mainClassName}>
        <div className={imageClassName}>
          {showPng ? (
            /* 1. Only show PNG if explicitly approved */
            <img
              src={imageUrl}
              alt="Question Visual"
              style={{
                width: parsedCustomSize?.width || undefined,
                height: parsedCustomSize?.height || undefined,
                maxWidth: "100%",
              }}
            />
          ) : (
            /* 2. Fallback to raw SVG */
            <img
              src={svgSrc}
              alt="Original Diagram"
              style={{
                width: parsedCustomSize?.width || undefined,
                height: parsedCustomSize?.height || undefined,
                maxWidth: "100%",
              }}
            />
          )}
        </div>
      </Stack>
    </NodeViewWrapper>
  );
};

export default SimpleSvg;
