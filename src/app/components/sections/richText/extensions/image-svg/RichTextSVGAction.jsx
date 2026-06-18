import React from "react";
import { Collapse, Divider, Stack, Typography } from "@mui/material";
import { NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import FormGenerator from "@/modules/form/FormGenerator";
import UploadFile from "@/modules/upload/UploadFile";
import Button from "@/elements/button/Button";
import Dropdown from "@/elements/dropdown/Dropdown";
import IconPopover from "@/elements/icon/IconPopover";
import { getLabel } from "@/src/app/data/locale";

const useSvgPackage = (editor) => {
  const [svgData, setSvgData] = useState("");

  const insertSvgImage = (event, svgSize, customSize) => {
    const file = event?.length > 0 && event[0]?.file;

    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgContent = e.target.result;
        // setSvgData(svgContent);
        const test = `<svg-react size='${svgSize}' customSize='${JSON.stringify(customSize)}' data='${svgContent}'></svg-react>`;
        editor.commands.insertContent(test);
      };
      reader.readAsText(file);
    }
  };

  const svgStates = {
    states: {
      svgData,
    },
    setters: {
      setSvgData,
    },
    actions: {
      insertSvgImage,
    },
  };

  return svgStates;
};

export default function SvgButtons(props) {
  const svgPackage = useSvgPackage(props?.editor);
  const [svgFile, setSvgFile] = useState();
  const [svgSize, setSvgSize] = useState("md");
  const [svgCustomSize, setSvgCustomSize] = useState();
  const [openCustomOption, setOpenCustomOption] = useState(false);

  const {
    states: svgStates,
    setters: svgSetters,
    actions: svgActions,
  } = svgPackage;

  const handleSelectDropdown = (e) => {
    try {
      const val = e.target.value;

      if (val == "custom") {
        setOpenCustomOption(true);
      } else {
        setSvgCustomSize(null);
        setOpenCustomOption(false);
        setSvgSize(val);
      }
    } catch (err) {}
  };
  const handleCustomOption = (params) => {
    try {
      setSvgCustomSize(params?.formikValues);
    } catch (err) {}
  };
  const handleSubmit = () => {
    try {
      svgActions.insertSvgImage(svgFile, svgSize, svgCustomSize);

      setSvgSize(null);
      setSvgCustomSize(null);
      setOpenCustomOption(false);
    } catch (err) {}
  };

  const handleGetFile = (value) => {
    try {
      setSvgFile(value);
    } catch (err) {}
  };

  React.useEffect(() => {
    setSvgSize(null);
    setSvgCustomSize(null);
    setOpenCustomOption(false);
  }, []);

  return (
    <Stack>
      <IconPopover
        button={{
          startIcon: "AddPhotoAlternateOutlined",
          theme: "secondary",
        }}
      >
        <Stack padding={"1rem"} spacing={2}>
          <UploadFile
            {...{
              type: "file",
              label: {
                en: "Upload Image",
                zh: "上传图片",
              },
              accept: {
                svg: true,
              },
            }}
            handleGetFile={handleGetFile}
          />
          <Stack direction="row" spacing={1} alignItems={"center"}>
            <Typography>{getLabel({ name: "selectImageSize" })}</Typography>
            <Dropdown
              data={[
                {
                  id: "sm",
                  label: "Small",
                },
                {
                  id: "md",
                  label: "Medium",
                },
                {
                  id: "lg",
                  label: "Large",
                },
                {
                  id: "xl",
                  label: "Extra Large",
                },
                {
                  id: "custom",
                  label: "Custom",
                },
              ]}
              defaultValue={svgSize}
              handleChange={handleSelectDropdown}
            />
          </Stack>

          <Collapse in={openCustomOption}>
            <FormGenerator
              fieldClass="flex-row gap-2"
              head={{
                width: {
                  type: "number",
                  label: "Width",
                  endAdornment: {
                    subtitle: "px",
                  },
                },
                height: {
                  type: "number",
                  label: "Height",
                  endAdornment: {
                    subtitle: "px",
                  },
                },
              }}
              hideButtonSubmit={true}
              onChangeValue={handleCustomOption}
            />
          </Collapse>

          <Divider />

          <Button headType="submit" handleClick={handleSubmit} />
        </Stack>
      </IconPopover>
    </Stack>
  );
}
