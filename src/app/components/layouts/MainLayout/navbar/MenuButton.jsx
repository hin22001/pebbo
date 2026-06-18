import React from "react";
import IconButton from "@/elements/icon/IconButton";

const MenuButton = ({
  showNavigation,
  onMenuClick,
  variant = "element", // "element" or "custom"
}) => {
  const iconName =
    variant === "custom" ? (showNavigation ? "MenuOpen" : "Menu") : "Menu";

  return <IconButton icon={iconName} handleClick={onMenuClick} />;
};

export default MenuButton;
