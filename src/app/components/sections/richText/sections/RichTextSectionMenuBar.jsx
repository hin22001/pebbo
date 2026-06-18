import { Checkbox, Divider, Stack, Typography } from "@mui/material";
import React from "react";
import {
  RichTextDropdownAction,
  RichTextFractionAction,
  RichTextKatexAction,
  RichTextSVGAction,
  RichTextSegmentAction,
  RichTextTextFieldAction,
} from "../extensions";
import { Button } from "@/components/elements";

const mainClassName = "section-rich-text-section";

export default function MenuBar(props) {
  const { editor, isExplanation } = props;

  const [inputValue, setInputValue] = React.useState("");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <>
      {editor && (
        <Stack className={mainClassName + "-menu-bar"} spacing={"1rem"}>
          {!isExplanation && (
            <Stack
              className="card-flat"
              direction="row"
              sx={{ gap: "1rem" }}
              flexWrap={"wrap"}
            >
              <RichTextDropdownAction editor={editor} />

              <RichTextTextFieldAction editor={editor} />

              <RichTextFractionAction editor={editor} />

              <Divider orientation="vertical" flexItem />

              <RichTextSegmentAction editor={editor} />

              <RichTextSVGAction editor={editor} />

              <Divider orientation="vertical" flexItem />

              <Button
                label="Title"
                handleClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={
                  editor.isActive("heading", { level: 2 })
                    ? "secondary-toggle"
                    : "secondary"
                }
              />

              <Button
                handleClick={() => editor.chain().focus().toggleBold().run()}
                className={
                  editor.isActive("bold") ? "secondary-toggle" : "secondary"
                }
              >
                <Typography fontWeight={"bold"}>Bold</Typography>
              </Button>

              <Button
                handleClick={() => editor.chain().focus().toggleItalic().run()}
                className={
                  editor.isActive("italic") ? "secondary-toggle" : "secondary"
                }
              >
                <Typography component={"i"}>Unit</Typography>
              </Button>

              <Button
                handleClick={() => editor.chain().focus().setParagraph().run()}
                className={
                  editor.isActive("paragraph")
                    ? "secondary-toggle"
                    : "secondary"
                }
              >
                <Typography component={"p"}>Paragraph</Typography>
              </Button>

              <Divider orientation="vertical" flexItem />

              <Button
                label="Undo"
                startIcon="UndoOutlined"
                theme="secondary"
                handleClick={() => editor.chain().focus().undo().run()}
              />

              <Button
                label="Redo"
                startIcon="RedoOutlined"
                theme="secondary"
                handleClick={() => editor.chain().focus().redo().run()}
              />
            </Stack>
          )}

          <Stack className="card-flat">
            <RichTextKatexAction editor={editor} />
          </Stack>
        </Stack>
      )}
    </>
  );
}
