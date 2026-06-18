import React from "react";
import { styled } from "@mui/material/styles";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Helpers } from "@/src/app/utils";
import { locale } from "@/src/app/data/locale";

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 82,
  height: 50,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    top: "0.55rem",
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(42px)",
      "& .MuiSwitch-thumb:before": {
        content: '"中"',
        fontFamily: "Open Hunin",
        justifyContent: "center",
        alignItems: "center",
        display: "grid",
        // backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        // 	'#fff',
        // )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: Helpers.getColor("light-accent"),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: Helpers.getColor(),
    width: 32,
    height: 32,
    "&::before": {
      content: '"EN"',
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
      display: "grid",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      // backgroundRepeat: 'no-repeat',
      // backgroundPosition: 'center',
      // backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
      // 	'#fff',
      // )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "white",
    borderRadius: "10rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    padding: "0rem 0.6rem",
    "&::before": {
      content: '"EN"',
      left: 12,
      color: Helpers.getColor(),
    },
    "&::after": {
      content: '"中"',
      right: 12,
      color: Helpers.getColor(),
    },
  },
}));

export default function CustomizedSwitches(props) {
  const mainClassName = "element-switch";

  let { label, handleSwitch, data, defaultValue, value } = props;

  // const data = {
  // 	on: {
  // 		id: 'en',
  // 		label: 'EN'
  // 	},
  // 	off: {
  // 		id: 'zh',
  // 		label: 'ZH'
  // 	}
  // }

  const [stateValue, setValue] = React.useState(value);

  const onChange = async (event) => {
    try {
      const checked = event.target.checked;
      const newValue = checked ? data?.on?.id : data?.off?.id;

      setValue(newValue);

      if (handleSwitch) {
        handleSwitch(newValue);
      }
    } catch (err) {}
  };

  React.useEffect(() => {
    setValue(value);
  }, [value]);

  return (
    <FormGroup className={mainClassName}>
      <FormControlLabel
        control={
          <MaterialUISwitch
            sx={{ m: 1 }}
            {...(defaultValue ? { checked: defaultValue == data?.on?.id } : {})}
            {...(stateValue ? { checked: stateValue == data?.on?.id } : {})}
          />
        }
        label={locale(label || "")}
        onChange={onChange}
      />
    </FormGroup>
  );
}
