import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Stack, TextField, Typography } from "@mui/material";
import { Button } from "@/components/elements";
import { getLabel, locale } from "@/src/app/data/locale";
import { ModalScreen } from "@/src/app/components/modules";
import { FractionInput } from ".";
import { RichText } from "../..";

const FractionAction = (props) => {
  const { editor } = props;

  const [openModalDropdown, setOpenModalDropdown] = React.useState(0);
  const [answer, setAnswer] = React.useState("");
  const [explanation, setExplanation] = React.useState(null);
  const [fractionArr, setFractionArr] = React.useState([
    { id: 0, wholeNumber: "", numerator: "", denominator: "" },
  ]);

  const insert = () => {
    setOpenModalDropdown(openModalDropdown + 1);
  };

  let refEditor = React.useRef(null);

  const replaceSpacesWithNbsp = (explanation) => {
    const modifiedContent = explanation?.content?.map((node) => {
      if (node.type === "paragraph" && Array.isArray(node?.content)) {
        const modifiedContent = node?.content?.map((childNode) => {
          if (
            childNode.type === "text" &&
            typeof childNode?.text === "string"
          ) {
            // Replace spaces with &nbsp;
            const newText = childNode?.text?.replace(/ /g, "\u00A0");
            return { ...childNode, text: newText };
          }
          return childNode;
        });
        return { ...node, content: modifiedContent };
      }
      return node;
    });
    return { ...explanation, content: modifiedContent };
  };

  const handleEvent = () => {
    setOpenModalDropdown(false);

    if (editor) {
      const test = `
      <rich-text-fraction-component
        answer='${JSON.stringify(answer || "")}'
        explanation=${JSON.stringify(replaceSpacesWithNbsp(refEditor?.getJSON()) || "")}
      >
      </rich-text-fraction-component>`;

      editor.commands.insertContent(test);
      setAnswer("");
      setExplanation(null);
    }
  };

  return (
    <Stack>
      <Button
        handleClick={insert}
        label="Add Fraction Answer"
        startIcon={"SpaceDashboardOutlined"}
      />
      <ModalScreen
        width="70%"
        isOpen={openModalDropdown}
        confirmClose={false}
        title={"Create Fraction Input"}
        className="paper"
      >
        <Stack>
          <Stack width="80vh" height="150px" mb={1}>
            <Typography fontWeight="bold" mb={1}>
              Correct Answer
            </Typography>
            <FractionInput
              isEditor={true}
              fractionArr={fractionArr}
              setFractionArr={setFractionArr}
              getResult={(e) => setAnswer(e)}
              isInfo={false}
              isCorrect={false}
              answer={answer}
              explanation={explanation}
            />
          </Stack>
          <Stack width="80vh" height="150px" mb={45}>
            <Typography fontWeight="bold" mb={1}>
              Explanation
            </Typography>
            <Stack>
              <RichText
                value={explanation}
                refEditor={(instance) => {
                  refEditor = instance;
                }}
                isExplanation={true}
              />
            </Stack>
          </Stack>
          <Button
            pt={5}
            type="submit"
            label={getLabel({ name: "submit" })}
            disabled={answer === ""}
            handleClick={handleEvent}
          />
        </Stack>
      </ModalScreen>
    </Stack>
  );
};

export default FractionAction;
