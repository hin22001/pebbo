"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { ListItemIcon } from "@mui/material";

import { Button, IconCustom } from "..";

export default function DropdownButton(props) {
  const [anchorEl, setAnchorEl] = React.useState(false);
  const router = useRouter();

  const {
    position,
    useExpandIcon,
    theme,
    label,
    data,
    useLink,
    id,
    disabled,
    returnItem,
    icon,
    handleClickLink,
  } = props;

  let container;

  const handleClick = (event) => {
    setAnchorEl(!anchorEl);
  };

  const handleSelect = (item) => {
    if (props.handleSelect) {
      if (returnItem) {
        props.handleSelect(item);
      } else {
        props.handleSelect(item.value || item.id, item.href || null);
      }
    } else if (useLink) {
      router.replace(item.target + id);
    }

    setAnchorEl(!anchorEl);
  };

  React.useEffect(() => {
    if (document) {
      container = document.getElementById("main-layout");
    }
  }, []);

  return (
    <div className={"dropdown dropdown-button " + (disabled ? "disabled" : "")}>
      {icon ? (
        <IconButton
          aria-label="more"
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="contained"
          onClick={handleClick}
          disableRipple
        >
          <IconCustom icon={icon} {...(typeof icon == "object" ? icon : {})} />
        </IconButton>
      ) : useExpandIcon ? (
        <IconButton
          aria-label="more"
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="contained"
          onClick={handleClick}
          disableRipple
        >
          {anchorEl ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      ) : !disabled ? (
        <button
          className={
            "button-Pebbo button-dropdown rounded" + (theme ? theme : "yellow ")
          }
          onClick={handleClick}
        >
          {label}
          {anchorEl ? <ExpandLess /> : <ExpandMore />}
        </button>
      ) : (
        <Button disabled={disabled} theme="border " label={label} />
      )}
      {/* <Portal container={container}> */}
      <div
        className={
          "dropdown-item " +
          (anchorEl ? "active" : "hide") +
          " position-" +
          (position ? position : "left")
        }
      >
        {data &&
          data.map((item, index) => {
            if (item.href) {
              return (
                <Link href={item.href} key={"dropdown-button-" + index}>
                  <a onClick={() => handleClickLink(item)}>
                    <MenuItem className="menu-item">
                      {item.icon ? (
                        <ListItemIcon className="menu-icon">
                          <IconCustom icon={item.icon} />
                        </ListItemIcon>
                      ) : item.IconCustom ? (
                        <ListItemIcon className="menu-icon">
                          <IconCustom {...item.IconCustom} />
                        </ListItemIcon>
                      ) : null}
                      <ListItemText
                        className="menu-text"
                        primary={item.label}
                      />
                    </MenuItem>
                  </a>
                </Link>
              );
            } else if (item.disableSelect) {
              return (
                <MenuItem
                  key={"dropdown-button-" + index}
                  className="menu-item disable-select"
                >
                  {item.icon && (
                    <ListItemIcon className="menu-icon">
                      <IconCustom icon={item.icon} />
                    </ListItemIcon>
                  )}
                  <ListItemText className="menu-text" primary={item.label} />
                </MenuItem>
              );
            } else {
              return (
                <MenuItem
                  key={"dropdown-button-" + index}
                  className="menu-item"
                  onClick={() => handleSelect(item)}
                >
                  {item.icon && (
                    <ListItemIcon className="menu-icon">
                      <IconCustom icon={item.icon} />
                    </ListItemIcon>
                  )}
                  <ListItemText className="menu-text" primary={item.label} />
                </MenuItem>
              );
            }
          })}
        {!disabled && (
          <div
            className={"dropdown-backdrop " + (anchorEl ? "active" : "hide")}
            onClick={handleClick}
          ></div>
        )}
      </div>
      {/* </Portal> */}
    </div>
  );
}
