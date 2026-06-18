import { locale } from "@/src/app/data/locale";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import _ from "lodash";
import React from "react";
import { Button, IconButton } from "../../elements";

const mainClassName = "module-list";

function ListItemCustom(props) {
  const { label, subtitle, button, iconButton } = props;

  return (
    <ListItem className={mainClassName + "-item"}>
      <Stack
        className={mainClassName + "-item-wrap"}
        direction={"row"}
        spacing={2}
        alignItems={"center"}
      >
        <ListItemText
          className={mainClassName + "-item-label"}
          primary={locale(label)}
        />
        <ListItemText
          className={mainClassName + "-item-subtitle"}
          primary={locale(subtitle)}
        />
        {button && (
          <Stack className={mainClassName + "-item-button"}>
            <Button {...button} />
          </Stack>
        )}
        {iconButton && (
          <Stack className={mainClassName + "-item-icon-button"}>
            <IconButton {...iconButton} />
          </Stack>
        )}
      </Stack>
    </ListItem>
  );
}

export default function ListCustom(props) {
  const { data } = props;

  return (
    <Stack className={mainClassName + " card"}>
      <List>
        {data?.length > 0 &&
          data?.map((item, index) => {
            return (
              <>
                <ListItemCustom
                  {...(item || {})}
                  index={index}
                  key={mainClassName + "-item-" + index + _.uniqueId()}
                />
                {item?.child?.length > 0 && (
                  <>
                    <ListCustom
                      data={item?.child}
                      key={mainClassName + "-item-child-" + index}
                    />
                    {index < data?.length - 1 && (
                      <Divider
                        sx={{ marginTop: "3rem", marginBottom: "2rem" }}
                      />
                    )}
                  </>
                )}
              </>
            );
          })}
      </List>
    </Stack>
  );
}
