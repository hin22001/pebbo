import { NodeViewWrapper } from "@tiptap/react";
import React, { useState, useEffect, useRef } from "react";
import katex from "katex";
import { Stack, TextField } from "@mui/material";
import { Button } from "@/components/elements";

const SimpleKatex = ({ node, updateAttributes }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.attrs.originalString);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event) => {
    setEditText(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setIsEditing(false);
      updateAttributes({ originalString: editText });
    }
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <NodeViewWrapper as="span">
        <Stack direction="row" spacing={1}>
          <TextField
            ref={inputRef}
            type="text"
            value={editText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoFocus
            onBlur={(e) => {
              setEditText(node.attrs.originalString);
              setIsEditing(false);
            }}
            helperText='Press "Enter" to save'
          />
        </Stack>
      </NodeViewWrapper>
    );
  }

  const katexHtml = Katexing(node.attrs.originalString);

  return (
    <NodeViewWrapper
      className="make_inline"
      as="span"
      onDoubleClick={handleDoubleClick}
    >
      <span dangerouslySetInnerHTML={{ __html: katexHtml }} />
    </NodeViewWrapper>
  );
};

function Katexing(string) {
  var htmlString = katex.renderToString(string?.toString() || "", {
    throwOnError: false,
    //   displayMode: true
  });
  return htmlString;
}

export default SimpleKatex;
