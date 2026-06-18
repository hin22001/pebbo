import React from "react";
import { Checkbox, Stack } from "@mui/material";
import { ModalForm } from "@/components/templates/global/TableEditor/sections";
import { Button } from "@/components/elements";
import { getLabel } from "@/src/app/data/locale";

const TextFieldAction = (props) => {
  const { editor } = props;

  const [openModalDropdown, setOpenModalDropdown] = React.useState(0);

  const insert = () => {
    setOpenModalDropdown(openModalDropdown + 1);
  };

  const handleEvent = (value) => {
    setOpenModalDropdown(false);

    if (editor) {
      const test = `
      <rich-text-text-field-component
        answer='${JSON.stringify(value?.answer || "")}'
        label=${JSON.stringify(value?.label || "")}
        placeholder=${JSON.stringify(value?.placeholder || getLabel({ name: "fillTextInput" }))}
        unit=${JSON.stringify(value?.unit || "")}
        explanation=${JSON.stringify(value?.explanation || "")}
      >
      </rich-text-text-field-component>`;

      editor.commands.insertContent(test);
    }
  };

  return (
    <Stack>
      <Button
        handleClick={insert}
        label={getLabel({ name: "addTextField" })}
        startIcon={"Textsms"}
      />
      <ModalForm
        isOpen={openModalDropdown}
        disableConfirmSubmit={true}
        head={{
          title: "Create Text Input",
          forms: {
            label: {
              type: "string",
              label: {
                en: "Label",
                zh: "Label",
              },
              placeholder: {
                en: "Insert label for the text input",
                zh: "Insert label for the text input",
              },
            },
            placeholder: {
              type: "string",
              label: {
                en: "Placeholder",
                zh: "Placeholder",
              },
              placeholder: {
                en: "Insert placeholder for the text input",
                zh: "Insert placeholder for the text input",
              },
            },
            answer: {
              required: true,
              type: "string",
              label: {
                en: "Correct Answer",
                zh: "Correct Answer",
              },
              placeholder: {
                en: "Insert the correct answer",
                zh: "Insert the correct answer",
              },
            },
            unit: {
              type: "string",
              label: {
                en: "Unit",
                zh: "Unit",
              },
              placeholder: {
                en: "Insert unit for the options",
                zh: "Insert unit for the options",
              },
            },
            explanation: {
              type: "string",
              label: {
                en: "Explanation",
                zh: "Explanation",
              },
              multiline: true,
              rows: 3,
            },
          },
        }}
        submit={handleEvent}
      />
    </Stack>
  );
};

export default TextFieldAction;
