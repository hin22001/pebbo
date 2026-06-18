import { Button } from "@/components/elements";
import { Stack } from "@mui/material";
import { useState } from "react";

const useSegmentPackage = (editor) => {
  const [SegmentContent, setSegmentContent] = useState("");

  const insertSegment = () => {
    if (editor) {
      const test = `<rich-text-segment-component><h3>Segment Title</h3></rich-text-segment-component>`;
      editor.commands.insertContent(test);
    }
  };

  const segmentStates = {
    states: {
      SegmentContent,
    },
    setters: {
      setSegmentContent,
    },
    actions: {
      insertSegment,
    },
  };

  return segmentStates;
};

export default function SegmentButtons(props) {
  const segmentPackage = useSegmentPackage(props?.editor);

  const {
    states: segmentStates,
    setters: segmentSetters,
    actions: segmentActions,
  } = segmentPackage;

  return (
    <Stack>
      <Button
        handleClick={segmentActions.insertSegment}
        theme="secondary"
        startIcon="ViewAgendaOutlined"
        label="Segment"
      ></Button>
    </Stack>
  );
}
