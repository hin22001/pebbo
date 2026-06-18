import React, { Component } from "react";
import { getDataHead } from "@/src/app/data/head";
import {
  Stack,
  Typography,
  Card,
  TextField,
  IconButton,
  Button as ButtonMUI,
  Modal,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import AdminCard from "@/modules/card/AdminCard";
import NoticeCard from "@/modules/card/NoticeCard";
import StudentCard from "@/modules/card/StudentCard";
import TeacherCard from "@/modules/card/TeacherCard";
import { ContentLayout } from "@/layouts/ContentLayout";
import Loader from "@/elements/loader/Loader";
import Button from "@/elements/button/Button";
import AvatarSelectionModal from "@/elements/avatar/AvatarSelectionModal";
import UserAPI from "../../../data/api/UserAPI";
import Helpers from "../../../utils/Helpers";
import { locale } from "@/locale";
import { ImageHandler } from "../../elements";
import { withAppRouter } from "@/app/utils/withAppRouter";
import LoginAPI from "../../../data/api/LoginAPI";
import Image from "next/image";
import { LocalData } from "@/src/app/data/local";

class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "dashboard-page",
      loader: false,
      firstName: "",
      lastName: "",
      dataProfile: null,
      alert: false,
      newPassword: "",
      confirmPassword: "",
      head: null,
      image: 1,
      modal: false,
      dataSummary: null,
      displayLevel: 1,
    };

    this.updateName = this.updateName.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.updateAva = this.updateAva.bind(this);
  }

  async handleEvent(params) {
    try {
      switch (params?.type) {
        case "event":
          {
            // Handle event
          }
          break;
      }
    } catch (err) {}
  }

  async initialize() {
    try {
      const { initialProfileData, initialSummaryData } = this.props;
      const hasInitialData =
        initialProfileData != null || initialSummaryData != null;

      if (!hasInitialData) {
        this.setState({ loader: true });
      }

      let head = getDataHead({
        name: "headNoticeCard",
      })?.welcome;

      let head2 = await getDataHead({ name: "headDashboardPage" });

      let dataProfile;
      let dataSummary;

      if (hasInitialData) {
        dataProfile = initialProfileData ?? null;
        dataSummary = initialSummaryData ?? null;
      } else {
        const res = await LoginAPI.getStudentProfile();
        dataProfile = res?.payload?.data;
        const summaryRes = await UserAPI.getSummary();
        dataSummary = summaryRes?.payload?.data;
      }

      const displayLevel =
        dataSummary?.total_fully_accurate !== undefined
          ? Math.floor(dataSummary.total_fully_accurate / 100) + 1
          : 1;

      // Resolve the avatar number from localStorage, then profile_image, else
      // default to 1. Teachers have neither populated, which previously left
      // this undefined and crashed the avatar require() in render(). Clamp to
      // the unlocked level and to the 1–10 SVG range so it always resolves.
      const storedAvatar =
        parseInt(localStorage.getItem("ava")) ||
        parseInt(dataProfile?.profile_image) ||
        1;
      const maxUnlocked = Math.min(Math.max(displayLevel, 1), 10);
      const imageLocal = String(
        Math.min(Math.max(storedAvatar, 1), maxUnlocked),
      );
      localStorage.setItem("ava", imageLocal);

      this.setState({
        headNoticeCard: head,
        firstName: dataProfile?.first_name,
        lastName: dataProfile?.last_name,
        loader: false,
        dataProfile,
        head: head2,
        image: imageLocal,
        dataSummary,
        displayLevel,
      });
    } catch (err) {}
  }

  async updateName() {
    this.setState({ loader: true });

    try {
      const data = {
        first_name: this.state.firstName,
        last_name: this.state.lastName,
      };

      const res = await UserAPI.postChangeName({}, data);

      if (res?.payload?.status === 200) {
        await this.initialize();

        Helpers.openSnackbar({
          name: "dataSuccessfullyEdited",
          autoHideDuration: 3000,
        });
      } else {
        Helpers.openSnackbar({ message: res?.payload?.message });
      }
    } catch (error) {
      Helpers.openSnackbar({ message: error });
    }

    this.setState({ loader: false });
  }

  async resetPassword() {
    const { newPassword, confirmPassword, head } = this.state;
    if (confirmPassword === newPassword) {
      this.setState({ loader: true });

      try {
        const data = {
          new_password: newPassword,
        };

        const res = await UserAPI.postResetPassword({}, data);

        if (res?.payload?.status === 200) {
          await this.initialize();
          this.setState({ newPassword: "", confirmPassword: "" });

          Helpers.openSnackbar({
            name: "dataSuccessfullyEdited",
            autoHideDuration: 3000,
          });
        } else {
          Helpers.openSnackbar({ message: res?.message });
        }
      } catch (error) {
        Helpers.openSnackbar({ message: error });
      }

      this.setState({ loader: false });
    } else {
      Helpers.openSnackbar({ message: locale(head?.resetNoMatch) });
    }
  }

  getCustomerPortalUrl() {
    const isProd = process.env.NEXT_PUBLIC_IS_PROD === "true";
    const testUrl = process.env.NEXT_PUBLIC_TEST_CUSTOMER_PORTAL_URL;
    const prodUrl = process.env.NEXT_PUBLIC_PROD_CUSTOMER_PORTAL_URL;

    return isProd ? prodUrl : testUrl;
  }

  async componentDidMount() {
    await this.initialize();
  }

  updateAva(val) {
    localStorage.setItem("ava", val);
    this.setState({ image: val, modal: false });
    Helpers.openSnackbar({
      name: "dataSuccessfullyEdited",
      autoHideDuration: 3000,
    });
  }

  render() {
    const {
      state: {
        mainClassName,
        loader,
        firstName,
        lastName,
        dataProfile,
        head,
        newPassword,
        confirmPassword,
        image,
        modal,
        displayLevel,
      },
      props: { router },
    } = this;

    // Bulletproof guard: avatar SVGs are illustration-profile1..10. Even if
    // `image` is undefined or out of range (e.g. a teacher with no avatar),
    // clamp so the dynamic require() and the modal never get a bad value.
    const safeAvatar = Math.min(Math.max(parseInt(image) || 1, 1), 10);

    return (
      <>
        <Loader isOpen={loader} />
        <Card className={mainClassName + "-card"}>
          <Typography
            mb={3}
            fontSize={30}
            color="#231F20"
            fontWeight={600}
            sx={{ fontFamily: "'Advercase', serif !important" }}
          >
            {locale(head?.settings)}
          </Typography>
          <Stack
            width="100%"
            className={mainClassName + "-profile-section1-wrapper"}
          >
            <Stack className={mainClassName + "-profile-section1-card"}>
              <Stack
                mb={2}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography color="#231F20" fontSize={18} fontWeight={600}>
                  {locale(head?.profile)}
                </Typography>
                <Stack>
                  <ButtonMUI
                    onClick={this.updateName}
                    sx={{ textTransform: "none" }}
                    variant="contained"
                    size="small"
                  >
                    {locale(head?.save)}
                  </ButtonMUI>
                </Stack>
              </Stack>
              {/* <Stack justifySelf={'center'} className={mainClassName + '-border'}> */}
              <Image
                src={require(
                  `@/images/illustration/illustration-profile${safeAvatar}.svg`,
                )}
                width={200}
                height={200}
                borderRadius="20px"
                className={mainClassName + "-profile-image"}
                // alignSelf="center"
              ></Image>
              {/* <ImageHandler
                  src={require(`@/images/illustration/illustration-profile${image}.svg`)}
                  alt="ava"
                  width={200}
                  height={200}
                  borderRadius="20px"
                  // justifySelf={"center"}
                  // className={mainClassName + '-border'}
                /> */}
              {/* </Stack> */}

              <Stack mt={1} alignSelf={"center"} width={"50%"}>
                <ButtonMUI
                  onClick={() => this.setState({ modal: true })}
                  sx={{ textTransform: "none", fontSize: "14px" }}
                  variant="contained"
                  size="small"
                >
                  {locale(head?.selectAvatar)}
                </ButtonMUI>
              </Stack>
              <Stack mt={2}>
                <Typography mb={1} fontWeight={400}>
                  {locale(head?.firstName)}
                </Typography>
                <TextField
                  value={firstName}
                  onChange={(e) => this.setState({ firstName: e.target.value })}
                />
              </Stack>
              <Stack mt={2}>
                <Typography mb={1} fontWeight={400}>
                  {locale(head?.lastName)}
                </Typography>
                <TextField
                  value={lastName}
                  onChange={(e) => this.setState({ lastName: e.target.value })}
                />
              </Stack>
              {/* <Stack mt={2}>
                <Typography mb={1} fontWeight={400}>Email</Typography>
                <TextField />
              </Stack> */}
            </Stack>
            <Stack className={mainClassName + "-profile-section1-card"}>
              <Stack
                mb={2}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography color="#231F20" fontSize={18} fontWeight={600}>
                  {locale(head?.security)}
                </Typography>
              </Stack>
              <Stack mt={2}>
                <Typography mb={1} fontWeight={400}>
                  {locale(head?.password)}
                </Typography>
                <TextField
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    this.setState({ newPassword: e.target.value })
                  }
                />
              </Stack>
              <Stack mt={2}>
                <Typography mb={1} fontWeight={400}>
                  {locale(head?.resetPassword)}
                </Typography>
                <TextField
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    this.setState({ confirmPassword: e.target.value })
                  }
                />
              </Stack>
              <Stack mt={4} width="100%" alignItems="flex-end">
                <Stack width="fit-content">
                  <ButtonMUI
                    onClick={this.resetPassword}
                    sx={{ textTransform: "none" }}
                    variant="contained"
                    size="small"
                  >
                    {locale(head?.resetPasswordBtn)}
                  </ButtonMUI>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          {/* <Stack mt={3} width="100%" direction="row" justifyContent="space-between">
            <Stack className={mainClassName + '-profile-section1-card'}>
              <Stack mb={2} direction="row" justifyContent="space-between" alignItems="center">
                <Typography color="#231F20" fontSize={18} fontWeight={600}>Notifications</Typography>
              </Stack>
              <Stack mt={1} direction="row" alignItems="center">
                <ImageHandler
                  src={require('@/images/icon/icon-email.png')}
                  alt="ico"
                  width={24}
                  height={24}
                  borderRadius="20px"
                />
                <Typography color="#A6A8AB" fontWeight={400} ml={2}>Email Notifications</Typography>
              </Stack>
              <Stack mt={1} direction="row" alignItems="center">
                <ImageHandler
                  src={require('@/images/icon/icon-sms.png')}
                  alt="ico"
                  width={24}
                  height={24}
                  borderRadius="20px"
                />
                <Typography color="#A6A8AB" fontWeight={400} ml={2}>SMS Notification</Typography>
              </Stack>
              <Stack mt={1} direction="row" alignItems="center">
                <ImageHandler
                  src={require('@/images/icon/icon-notif.png')}
                  alt="ico"
                  width={24}
                  height={24}
                  borderRadius="20px"
                />
                <Typography color="#A6A8AB" fontWeight={400} ml={2}>Push Notification</Typography>
              </Stack>
            </Stack>
            <Stack className={mainClassName + '-profile-section1-card'}>
              <Stack mb={2} direction="row" justifyContent="space-between" alignItems="center">
                <Typography color="#231F20" fontSize={18} fontWeight={600}>Preferences</Typography>
              </Stack>
              <Stack direction="row">
                <Stack width="175px" mr={2}>
                  <Typography mb={1}>Theme</Typography>
                  <FormControl fullWidth>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value="light"
                      label="Theme"
                      // onChange={handleChange}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                <Stack width="175px">
                  <Typography mb={1}>Language</Typography>
                  <FormControl fullWidth>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value="en"
                      label="Language"
                      // onChange={handleChange}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="zh">Chinese</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Stack>
          </Stack> */}
          <Stack mt={3} className={mainClassName + "-profile-section2-card"}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography color="#231F20" fontSize={18} fontWeight={600}>
                {locale(head?.accActions)}
              </Typography>
            </Stack>
            <Stack mt={3} width="100%" direction="row">
              {/* <Stack width="293px" mr={2}>
                <ButtonMUI sx={{textTransform: 'none', height: '40px'}} variant="contained">
                  Delete Account
                </ButtonMUI>
              </Stack>
              <Stack width="293px" mr={2}>
                <ButtonMUI sx={{textTransform: 'none', backgroundColor: '#00CDD2', height: '40px'}} variant="contained">
                  Deactivate Account
                </ButtonMUI>
              </Stack> */}
              <Stack width="293px">
                <ButtonMUI
                  sx={{ textTransform: "none", height: "40px" }}
                  variant="contained"
                >
                  {locale(head?.manageSubs)}
                </ButtonMUI>
              </Stack>
            </Stack>
          </Stack>
        </Card>
        {/* <Card className={mainClassName + '-card'}>
          <Stack width="100%" alignItems="center">
            <Stack width="100%" alignItems="flex-end">
              <Stack width="fit-content">
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="medium"
                  onClick={() => router.push('/dashboard')}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              </Stack>
            </Stack>
            <Typography className={mainClassName + '-title'}>{locale(head?.accountInformation)}</Typography>
            <Stack mt={3} width="80%" alignItems="flex-start">
              <Stack width="100%" direction="row">
                <Stack width="50%">
                  <Stack width="100%" mb={1}>
                    <Typography fontSize={16} fontWeight="600">{locale(head?.firstName)}</Typography>
                    <TextField value={firstName} onChange={(e) => this.setState({ firstName: e.target.value })} className={mainClassName + '-input'} id="outlined-basic" label="" variant="outlined" />
                  </Stack>
                  <Stack width="100%" mb={1}>
                    <Typography fontSize={16} fontWeight="600">{locale(head?.lastName)}</Typography>
                    <TextField value={lastName} onChange={(e) => this.setState({ lastName: e.target.value })} className={mainClassName + '-input'} id="outlined-basic" label="" variant="outlined" />
                  </Stack>
                  <Stack width="100%" mb={1}>
                    <Typography fontSize={16} fontWeight="600">{locale(head?.schoolId)}</Typography>
                    <TextField value={dataProfile?.school_id} disabled className={mainClassName + '-input'} id="outlined-basic" label="" variant="outlined" />
                  </Stack>
                  <Stack width="100%" mb={1}>
                    <Typography fontSize={16} fontWeight="600">{locale(head?.role)}</Typography>
                    <TextField value={dataProfile?.role === 'student' ? locale(head?.student) : locale(head?.teacher)} disabled className={mainClassName + '-input'} id="outlined-basic" label="" variant="outlined" />
                  </Stack>
                  <Stack width="100%" mb={1}>
                    <Typography fontSize={16} fontWeight="600">{locale(head?.referralCode)}</Typography>
                    <TextField value={dataProfile?.referral_code} disabled className={mainClassName + '-input'} id="outlined-basic" label="" variant="outlined" />
                  </Stack>
                  <Stack width="100%" mb={1}>
                    <Typography fontSize={16} fontWeight="600">{locale(head?.referredBy)}</Typography>
                    <TextField value={dataProfile?.referred_by} disabled className={mainClassName + '-input'} id="outlined-basic" label="" variant="outlined" />
                  </Stack>
                  <Stack width="100%" mb={1}>
                    <Typography fontSize={16} fontWeight="600">{locale(head?.subscription)}</Typography>
                    <TextField value={dataProfile?.paying ? locale(head?.active) : locale(head?.notActive)} disabled className={mainClassName + '-input'} id="outlined-basic" label="" variant="outlined" />
                  </Stack>
                </Stack>
                <Stack width="50%" justifyContent="center" alignItems="center">
                  <ImageHandler
                    src={require('@/images/illustration/illustration-mascot-surfing-2.png')}
                    alt="img"
                    width={200}
                    height={200}
                  />
                  <Stack mt={2}>
                    <Button
                      handleClick={() => window.open(this.getCustomerPortalUrl(), "_blank")}
                      label={locale(head?.subscription)}
                    />
                  </Stack>
                </Stack>
              </Stack>
              <Stack mt={5} width="100%" alignItems="center">
                <Stack onClick={this.updateName} alignItems="center" className={mainClassName + '-form-btn'}>
                  <Typography className={mainClassName + '-form-btn-txt'}>{locale(head?.update)}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Card> */}

        <AvatarSelectionModal
          isOpen={modal}
          onClose={() => this.setState({ modal: false })}
          currentAvatar={safeAvatar}
          displayLevel={displayLevel}
          onSelectAvatar={this.updateAva}
          titleText={locale(head?.selectAvatar)}
          mainClassName={mainClassName}
          avatarSize={65}
          gridColumns={5}
          modalWidth={700}
          titleFontSize={16}
        />
      </>
    );
  }
}

export default withAppRouter(Index);
