import React from "react";
import {
  AppBar,
  Toolbar,
  Stack,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import ImageHandler from "@/elements/image/ImageHandler";
import IconCustom from "@/elements/icon/IconCustom";
import { UserCard } from "@/app/components/layouts/MainLayout/navbar";
import SelectLanguage from "@/sections/dropdown/SelectLanguage";
import { locale } from "@/locale";

// Import all navbar components
import Logo from "./Logo";
import NavigationButtons from "./NavigationButtons";
import MenuButton from "./MenuButton";
import YearSelector from "./YearSelector";
import UserChips from "./UserChips";
import ClassroomSelector from "./ClassroomSelector";
import AudioMuteToggle from "./AudioMuteToggle";

const Navbar = ({
  // Common props
  mainClassName,
  userType, // "admin", "student", "teacher"
  dataUser,
  head,
  head2,
  showUserDetail,

  // Event handlers
  onUserCardClick,
  onUserCardClose,
  onMenuClick,

  // Student specific props
  loadingYear,
  dataSummary,
  onChangeYear,

  // Teacher specific props
  showNavigation,
  classroom,
  selectedClass,
  loadingClassroom,
  onChangeClassroom,

  // Admin specific props
  customRoleText,

  // Student specific props for UserCard
  showMoreButton,
  showSubscriptionStatus,
  truncateName,
  isPaid,
}) => {
  const renderLeftSection = () => {
    switch (userType) {
      case "admin":
        return (
          <Stack width="100%" className={mainClassName + "-action-start"}>
            <Logo mainClassName={mainClassName} showLink={true} />
            <NavigationButtons mainClassName={mainClassName} head2={head2} />
          </Stack>
        );

      case "student":
        return (
          <Stack className={mainClassName + "-action-start"}>
            <MenuButton
              showNavigation={showNavigation}
              onMenuClick={onMenuClick}
              variant="element"
            />
          </Stack>
        );

      case "teacher":
        return (
          <Stack className={mainClassName + "-action-start"}>
            <MenuButton
              showNavigation={showNavigation}
              onMenuClick={onMenuClick}
              variant="custom"
            />
            <Logo mainClassName={mainClassName} showLink={true} />
          </Stack>
        );

      default:
        return null;
    }
  };

  const renderRightSection = () => {
    const commonElements = (
      <>
        <SelectLanguage
          label="Selected Region"
          type={
            userType === "admin" || userType === "teacher"
              ? "switch"
              : undefined
          }
        />
        {userType !== "teacher" && <AudioMuteToggle />}
        <UserCard
          dataUser={dataUser}
          head2={head2}
          mainClassName={mainClassName}
          onUserCardClick={onUserCardClick}
          customRoleText={
            userType === "admin"
              ? head2?.admin
              : userType === "teacher"
                ? head2?.teacher
                : undefined
          }
          showMoreButton={userType === "student" ? showMoreButton : undefined}
          showSubscriptionStatus={
            userType === "student" ? showSubscriptionStatus : undefined
          }
          truncateName={userType === "student" ? truncateName : undefined}
          isPaid={userType === "student" ? isPaid : undefined}
        />
      </>
    );

    switch (userType) {
      case "admin":
        return (
          <Stack
            className={mainClassName + "-action-end"}
            direction={"row"}
            spacing={1}
            alignItems={"center"}
          >
            <Stack direction="row" className="desktop-only">
              <Stack
                direction="row"
                className={mainClassName + "-ico-wrapper-inactive"}
              >
                <ImageHandler
                  className={mainClassName + "-ico"}
                  src={require("@/images/icon/icon-compass.png")}
                  alt="ico book"
                />
                <Typography
                  className={mainClassName + "-ico-text-inactive"}
                  sx={{
                    fontFamily: "'Advercase', serif !important",
                    letterSpacing: "0.07rem",
                  }}
                >
                  {locale(head2?.guide)}
                </Typography>
              </Stack>
              {commonElements}
            </Stack>
          </Stack>
        );

      case "student":
        return (
          <Stack
            className={mainClassName + "-action-end"}
            direction={"row"}
            spacing={1}
            alignItems={"center"}
          >
            <YearSelector
              mainClassName={mainClassName}
              dataUser={dataUser}
              head2={head2}
              loadingYear={loadingYear}
              onChangeYear={onChangeYear}
            />
            <UserChips dataSummary={dataSummary} dataUser={dataUser} />
            {commonElements}
          </Stack>
        );

      case "teacher":
        return (
          <Stack
            className={mainClassName + "-action-end"}
            direction={"row"}
            spacing={1}
            alignItems={"center"}
          >
            {commonElements}
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <AppBar className={mainClassName + "-app-bar"} position="static">
      <Toolbar className={mainClassName + "-tool-bar"}>
        {renderLeftSection()}
        {renderRightSection()}
      </Toolbar>

      {/* User Menu */}
      <Menu
        sx={{ mt: "45px" }}
        className={mainClassName + "-menu"}
        id="menu-user-card"
        anchorEl={showUserDetail}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(showUserDetail)}
        onClose={onUserCardClose}
      >
        {head?.userSetting?.length > 0 &&
          head?.userSetting?.map((setting, indexSetting) => (
            <MenuItem
              key={"menu-setting-" + setting.id + "-" + indexSetting}
              onClick={() => onUserCardClose(setting.id)}
            >
              <ListItemIcon>
                <IconCustom icon={setting.icon} />
              </ListItemIcon>
              <Typography>{locale(setting.label)}</Typography>
            </MenuItem>
          ))}
      </Menu>
    </AppBar>
  );
};

export default Navbar;
