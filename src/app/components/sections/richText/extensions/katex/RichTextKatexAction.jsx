import {
  IconButton,
  Stack,
  TextField,
  Typography,
  Button as MuiButton,
  ButtonGroup,
  Divider,
} from "@mui/material";
import { useState } from "react";
import {
  Button,
  IconCustom,
  IconPopover,
  Tooltip,
} from "@/components/elements";
import { LinkWrapper } from "@/src/app/components/modules";

const useKatexPackage = (editor) => {
  const [katexInput, setKatexInput] = useState("");

  const [wholeFrac, setwholeFrac] = useState("");
  const [numeratorFrac, setnumeratorFrac] = useState("");
  const [denomenatorFrac, setdenomenatorFrac] = useState("");

  const handleKatexInputChange = (event) => setKatexInput(event.target.value);

  const insertKatex = () => {
    if (editor) {
      const katexString = `<katex-react originalString="${katexInput}"></katex-react>`;
      editor.commands.insertContent(katexString);
    }
  };

  const insertPlus = () => {
    if (editor) {
      const katexString = `<katex-react originalString="+"></katex-react>`;
      editor.commands.insertContent(katexString);
    }
  };

  const insertMinus = () => {
    if (editor) {
      const katexString = `<katex-react originalString="-"></katex-react>`;
      editor.commands.insertContent(katexString);
    }
  };

  const insertDivide = () => {
    if (editor) {
      const katexString = `<katex-react originalString="\\div"></katex-react>`;
      editor.commands.insertContent(katexString);
    }
  };

  const insertMultiply = () => {
    if (editor) {
      const katexString = `<katex-react originalString="\\times"></katex-react>`;
      editor.commands.insertContent(katexString);
    }
  };

  const insertEqual = () => {
    if (editor) {
      const katexString = `<katex-react originalString="="></katex-react>`;
      editor.commands.insertContent(katexString);
    }
  };

  const insertFraction = () => {
    if (editor) {
      const katexString = `<katex-react originalString="${wholeFrac}\\frac{${numeratorFrac}}{${denomenatorFrac}}"></katex-react>`;
      editor.commands.insertContent(katexString);
    }
  };

  const katexStates = {
    states: {
      katexInput,
      wholeFrac,
      numeratorFrac,
      denomenatorFrac,
    },
    setters: {
      setKatexInput,
      setwholeFrac,
      setnumeratorFrac,
      setdenomenatorFrac,
    },
    actions: {
      handleKatexInputChange,
      insertKatex,
      insertPlus,
      insertMinus,
      insertMultiply,
      insertDivide,
      insertEqual,
      insertFraction,
    },
  };

  return katexStates;
};

function FractionInput({ katexPackage }) {
  const {
    states: katexStates,
    setters: katexSetters,
    actions: katexActions,
  } = katexPackage;

  return (
    <Stack
      className="fraction-input-container"
      spacing={1}
      direction="row"
      alignItems={"center"}
    >
      <TextField
        type="text"
        className="fraction-whole-number"
        value={katexStates.wholeFrac}
        onChange={(e) => katexSetters.setwholeFrac(e.target.value)}
        placeholder="Whole"
        height="100%"
      />
      <Stack className="fraction" spacing={1}>
        <TextField
          type="text"
          className="fraction-numerator"
          value={katexStates.numeratorFrac}
          onChange={(e) => katexSetters.setnumeratorFrac(e.target.value)}
          placeholder="Numerator"
        />
        <Divider />
        <TextField
          type="text"
          className="fraction-denominator"
          value={katexStates.denomenatorFrac}
          onChange={(e) => katexSetters.setdenomenatorFrac(e.target.value)}
          placeholder="Denominator"
        />
      </Stack>
      <Button handleClick={katexActions.insertFraction}>Insert</Button>
    </Stack>
  );
}

export default function KatexButtons(props) {
  const katexPackage = useKatexPackage(props?.editor);

  const {
    states: katexStates,
    setters: katexSetters,
    actions: katexActions,
  } = katexPackage;

  return (
    <Stack direction="row" spacing={1} alignItems={"center"} flexWrap="wrap">
      <IconPopover
        button={{
          startIcon: "Functions",
          label: "Equation",
          theme: "secondary",
        }}
      >
        <Stack padding={"1rem"} spacing={1}>
          <Stack spacing={1} direction={"row"} alignItems={"center"}>
            <TextField
              value={katexStates.katexInput}
              onChange={katexActions.handleKatexInputChange}
              placeholder="Add your equation here"
            />
            <Tooltip
              title={
                <Stack spacing={1} direction={"row"} flexWrap={"wrap"}>
                  <Typography>
                    See Katex documentation formula{" "}
                    <a href={"https://katex.org/"} className="text-link">
                      here
                    </a>
                  </Typography>
                </Stack>
              }
            >
              <IconCustom icon="Info" theme="color-primary" />
            </Tooltip>
          </Stack>
          <Button label="Insert" handleClick={katexActions.insertKatex} />
        </Stack>
      </IconPopover>

      <Divider orientation="vertical" flexItem />

      <ButtonGroup
        height={"2.5rem"}
        className="border-primary"
        variant="outlined"
        aria-label="outlined button group"
      >
        <MuiButton
          className="border-primary text-h3"
          onClick={katexActions.insertMultiply}
        >
          *
        </MuiButton>
        <MuiButton
          className="border-primary text-h3"
          onClick={katexActions.insertDivide}
        >
          /
        </MuiButton>
        <MuiButton
          className="border-primary text-h3"
          onClick={katexActions.insertPlus}
        >
          +
        </MuiButton>
        <MuiButton
          className="border-primary text-h3"
          onClick={katexActions.insertMinus}
        >
          -
        </MuiButton>
        <MuiButton
          className="border-primary text-h3"
          onClick={katexActions.insertEqual}
        >
          =
        </MuiButton>
      </ButtonGroup>

      <Divider orientation="vertical" flexItem />

      <IconPopover
        button={{
          startIcon: "SpaceDashboardOutlined",
          label: "Fraction",
          theme: "secondary",
        }}
      >
        <Stack padding={"1rem"} spacing={1}>
          <FractionInput katexPackage={katexPackage} />
        </Stack>
      </IconPopover>
    </Stack>
  );
}
