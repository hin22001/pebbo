import React from "react";
import { Checkbox, Stack } from "@mui/material";
import { ModalForm } from "@/components/templates/global/TableEditor/sections";
import { Button } from "@/components/elements";

const DropdownAction = (props) => {
  const { editor } = props;

  const [openModalDropdown, setOpenModalDropdown] = React.useState(0);
  const [data, setData] = React.useState();

  const insertDropdown = () => {
    setOpenModalDropdown(openModalDropdown + 1);
  };

  const handleEvent = (value) => {
    setData(value?.options);
    setOpenModalDropdown(0);

    if (editor && value?.options?.length > 0) {
      const options = value?.options?.map((item) => {
        return {
          id: item?.id,
          label: item?.label + (value?.unit ? " " + value?.unit : " "),
        };
      });

      const answers = value?.options?.filter((item) => item.checked);

      const test = `
      <rich-text-dropdown-component 
        answers='${JSON.stringify(answers || [])}'
        options='${JSON.stringify(options || [])}'
        label=${JSON.stringify(value?.label || "")}
        placeholder=${JSON.stringify(value?.placeholder || "Select")}
        unit=${JSON.stringify(value?.unit || "")}
        explanation=${JSON.stringify(value?.explanation || "")}
      >
      </rich-text-dropdown-component>`;

      editor.commands.insertContent(test);
    }
  };

  return (
    <Stack>
      <Button
        handleClick={insertDropdown}
        label="Add Answer Options"
        startIcon={"Checklist"}
      ></Button>
      <ModalForm
        isOpen={openModalDropdown}
        disableConfirmSubmit={true}
        head={{
          title: "Create Answer Options",
          forms: {
            label: {
              type: "string",
              label: {
                en: "Label",
                zh: "Label",
              },
              placeholder: {
                en: "Insert label for the answer dropdown",
                zh: "Insert label for the answer dropdown",
              },
            },
            placeholder: {
              type: "string",
              label: {
                en: "Placeholder",
                zh: "Placeholder",
              },
              placeholder: {
                en: "Insert placeholder for the answer dropdown",
                zh: "Insert placeholder for the answer dropdown",
              },
            },
            options: {
              type: "chip-stack",
              tags: {
                useCheckbox: {
                  required: true,
                },
              },
              placeholder:
                'Fill your custom option and press "Enter" to insert the item',
              label: "Dropdown",
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

export default DropdownAction;
