"use client";

import { Stack, Typography } from "@mui/material";
import { useEditor, EditorContent } from "@tiptap/react";
import Paragraph from "@tiptap/extension-paragraph";
import StarterKit from "@tiptap/starter-kit";
import katex from "katex";
import "katex/dist/katex.min.css";

import { RichTextSectionMenuBar } from "./sections";
import {
  RichTextDropdown,
  RichTextFractionField,
  RichTextKatex,
  RichTextSegment,
  RichTextSVG,
  RichTextTextField,
} from "./extensions";
import React from "react";
import { Button, ImageHandler } from "@/components/elements";
import { useProps } from "@mui/x-data-grid/internals";
import { locale } from "@/src/app/data/locale";
import ttsManager from "@/app/utils/TextToSpeechManager";

const mainClassName = "section-rich-text";

// Helper function to extract all text from editor content
const extractAllText = (content) => {
  if (!content) return "";

  let text = "";
  const traverse = (node) => {
    if (node.type === "text") {
      text += node.text || "";
    } else if (
      node.type === "textfield" ||
      node.type === "dropdown" ||
      node.type === "fractionField"
    ) {
      text += " blank ";
    }

    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  };

  if (content.content && Array.isArray(content.content)) {
    content.content.forEach(traverse);
  }

  return text.trim();
};

const Tiptap = (props) => {
  const {
    title,
    value,
    refEditor,
    readOnly,
    editAnswerField,
    onRemove,
    onEdit,
    isExplanation,
    hideMenuBar,
    enableTTS = false,
    questionId,
  } = props;

  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      Paragraph,
      StarterKit,
      RichTextDropdown,
      RichTextKatex,
      RichTextSegment,
      RichTextSVG,
      RichTextTextField,
      RichTextFractionField,
    ],
    content: value,
    editorProps: {
      attributes: {
        spellcheck: "false",
        editAnswerField: editAnswerField,
      },
    },
  });

  const handleEvent = (value) => {
    try {
    } catch (err) {}
  };

  if (refEditor) {
    refEditor(editor);
  }

  return (
    <Stack className={mainClassName} spacing={2} position="relative">
      {title && (
        <Stack className={mainClassName + "-header"}>
          <Typography
            className={mainClassName + "-title text-h3"}
            component="h4"
          >
            {locale(title)}
          </Typography>
        </Stack>
      )}

      <Stack className={mainClassName + "-content"} spacing={2}>
        <Stack direction={"row"} spacing={1}>
          <Stack spacing={2} width={"100%"}>
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="flex-end"
            >
              {onRemove && (
                <>
                  <Typography
                    zIndex={1}
                    textAlign="center"
                    fontSize={12}
                    fontWeight={300}
                    width="120px"
                  >
                    Remove Question
                  </Typography>
                  <Stack onClick={onRemove}>
                    <ImageHandler
                      src={require("@/images/icon/icon-wrong.svg")}
                      alt="ico-wrong"
                      className={mainClassName + "-ico-wrong-question"}
                    />
                  </Stack>
                </>
              )}
              {onEdit && (
                <Stack onClick={onEdit}>
                  <ImageHandler
                    src={require("@/images/icon/icon-edit-colored.svg")}
                    alt="ico-edit"
                    className={mainClassName + "-ico-wrong-question"}
                  />
                </Stack>
              )}
            </Stack>
            {!readOnly && !hideMenuBar && (
              <RichTextSectionMenuBar
                editor={editor}
                isExplanation={isExplanation}
              />
            )}
            <Stack className="card-flat-custom" backgroundColor="#f6f9ff">
              <EditorContent
                editor={editor}
                className={mainClassName + "-editor"}
                editorContentRef={(val) => {}}
                data-question-id={questionId}
              />
            </Stack>
          </Stack>
        </Stack>
        {/* <Button
          headType='submit'
          handleClick={() => {
            const editorJson = editor.getJSON()


            const editorHTML = editor.getHTML()


            const editorText = editor.getText()



          }}
        /> */}
      </Stack>
    </Stack>
  );
};

export default Tiptap;
