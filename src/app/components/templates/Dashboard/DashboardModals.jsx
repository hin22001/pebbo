import React from "react";
import {
  Modal,
  Box,
  Stack,
  Typography,
  IconButton,
  Button as ButtonMUI,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Loader,
  Congratulations,
  StreakCelebration,
  LevelUpCelebration,
  AvatarSelectionModal,
  AppReportDrawer,
  Button,
  ImageHandler,
} from "../../elements";
import { DailyStreakPopup } from "../../streak/daily-streak-popup";
import { locale } from "@/src/app/data/locale";

export default function DashboardModals({
  loader,
  isInitializing,
  showCongratulations,
  setShowCongratulations,
  showStreakCelebration,
  setShowStreakCelebration,
  showLevelUpCelebration,
  setShowLevelUpCelebration,
  showStreakPopup,
  setShowStreakPopup,
  consecutiveDays,
  setRunTour,
  modal,
  setModal,
  styleModal,
  head,
  mainClassName,
  attemptSubscribe,
  avatarModal,
  setAvatarModal,
  ava,
  displayLevel,
  updateAva,
  showAvatarUnlock,
  setShowAvatarUnlock,
  unlockedAvatarLevel,
  showAppReportDrawer,
  setShowAppReportDrawer,
}) {
  return (
    <>
      <Loader isOpen={loader} />
      <Congratulations
        isOpen={showCongratulations}
        resetModal={() => setShowCongratulations(false)}
      />
      <StreakCelebration
        isOpen={showStreakCelebration}
        resetModal={() => setShowStreakCelebration(false)}
      />
      <LevelUpCelebration
        isOpen={showLevelUpCelebration}
        resetModal={() => setShowLevelUpCelebration(false)}
      />

      {}
      {showStreakPopup && !loader && !isInitializing && (
        <DailyStreakPopup
          consecutiveDays={consecutiveDays}
          onClose={() => {
            setShowStreakPopup(false);
            localStorage.setItem("hasSeenStreakPopup", "true");

            const onboardingCompleted = localStorage.getItem(
              "pebbo_onboarding_completed",
            );
            if (!onboardingCompleted || onboardingCompleted !== "true") {
              const startTour = () => {
                const firstStepTarget = document.querySelector(
                  ".dashboard-page-profile-ava-wrapper",
                );
                if (firstStepTarget) {
                  window.scrollTo({ top: 0, behavior: "instant" });

                  setTimeout(() => {
                    setRunTour(true);
                  }, 500);
                } else {
                  setTimeout(startTour, 500);
                }
              };

              setTimeout(startTour, 1000);
            }
          }}
        />
      )}

      {}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleModal}>
          <Stack
            width="98%"
            mt={2}
            mb={-4}
            justifyContent="flex-end"
            alignItems="flex-end"
          >
            <Stack width="fit-content">
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setModal(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Stack>
          </Stack>
          <Stack width="100%" alignItems="center" mt={5}>
            <ImageHandler
              src={require("@/images/illustration/illustration-exercise.png")}
              alt="illustration"
              width={400}
              height={400}
            />
          </Stack>
          <Typography
            mb={2}
            mt={2}
            fontSize={28}
            fontWeight={600}
            textAlign="center"
            sx={{ fontFamily: "'Advercase', serif !important" }}
          >
            {locale(head?.modal?.title)}
          </Typography>
          <Typography className={mainClassName + "-description2"}>
            Unlock a world of fun and interactive learning!
          </Typography>
          <Typography className={mainClassName + "-description2"}>
            Subscribe now to access your personalized math journey!
          </Typography>
          <Stack mt={2} width="100%" alignItems="center" mb={4}>
            <div className="wrap-button">
              <Button handleClick={attemptSubscribe} label="Subscribe Now" />
            </div>
          </Stack>
        </Box>
      </Modal>

      {}
      <AvatarSelectionModal
        isOpen={avatarModal}
        onClose={() => setAvatarModal(false)}
        currentAvatar={ava}
        displayLevel={displayLevel}
        onSelectAvatar={updateAva}
        titleText={locale(head?.selectAvatar)}
        mainClassName={mainClassName}
        avatarSize={100}
        gridColumns={5}
        modalWidth={700}
        titleFontSize={20}
      />

      {}
      <Modal
        open={showAvatarUnlock}
        onClose={() => setShowAvatarUnlock(false)}
        aria-labelledby="avatar-unlock-modal-title"
        aria-describedby="avatar-unlock-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "#fff",
            borderRadius: "20px",
            outline: "none",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Stack
            width="98%"
            mb={-2}
            justifyContent="flex-end"
            alignItems="flex-end"
          >
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setShowAvatarUnlock(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Stack>

          <Stack alignItems="center" spacing={3}>
            <Typography
              fontSize={24}
              fontWeight={700}
              color="#231F20"
              textAlign="center"
              sx={{ fontFamily: "'Advercase', serif !important" }}
            >
              {locale(head?.levelUpNewAvatarUnlocked)}
            </Typography>

            {unlockedAvatarLevel && (
              <>
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                      @keyframes shimmer {
                        0% {
                          left: -100%;
                        }
                        100% {
                          left: 200%;
                        }
                      }
                      .avatar-unlock-shine::before {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
                        animation: shimmer 2s ease-in-out infinite;
                        z-index: 1;
                        pointer-events: none;
                        border-radius: 20px;
                      }
                    `,
                  }}
                />
                <Stack
                  className="avatar-unlock-shine"
                  sx={{
                    width: 200,
                    height: 200,
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "8px solid #8264ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    boxShadow:
                      "0 8px 16px rgba(130, 100, 255, 0.4), 0 4px 8px rgba(130, 100, 255, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(130, 100, 255, 0.1) 100%)",
                  }}
                >
                  <ImageHandler
                    src={require(
                      `@/images/illustration/illustration-profile${unlockedAvatarLevel}.svg`,
                    )}
                    alt="unlocked avatar"
                    width={200}
                    height={200}
                    borderRadius="20px"
                  />
                </Stack>
              </>
            )}

            <Stack
              className="avatar-unlock-shine"
              sx={{
                background:
                  "linear-gradient(135deg, rgba(130, 100, 255, 0.1) 0%, rgba(90, 63, 163, 0.1) 100%)",
                borderRadius: "12px",
                p: 2.5,
                px: 3,
                border: "1px solid rgba(130, 100, 255, 0.2)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Typography
                fontSize={17}
                fontWeight={500}
                color="#231F20"
                textAlign="center"
                sx={{ maxWidth: "90%", lineHeight: 1.6, mb: 2 }}
              >
                {locale(head?.reachedLevelChooseLook)?.replace(
                  "{level}",
                  unlockedAvatarLevel || "",
                )}
              </Typography>
              <Stack width="100%" alignItems="center">
                <ButtonMUI
                  onClick={() => {
                    setShowAvatarUnlock(false);
                    setAvatarModal(true);
                  }}
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    fontSize: "17px",
                    fontWeight: 500,
                    px: 3,
                    py: 1,
                  }}
                >
                  {locale(head?.selectAvatar)}
                </ButtonMUI>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Modal>

      <AppReportDrawer
        isOpen={showAppReportDrawer}
        onClose={() => setShowAppReportDrawer(false)}
      />

      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Button
          theme="light"
          variant="contained"
          handleClick={() => {
            const soundEnabled =
              localStorage.getItem("soundEnabled") !== "false";
            if (soundEnabled) {
              const audio = new Audio(
                "/sounds/Alert_exercise_page_turn_up_its_volume.mp3",
              );
              audio.play().catch(() => {});
            }
            setShowAppReportDrawer(true);
          }}
          label={locale("Report a Problem")}
          sx={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderRadius: "12px",
            padding: "8px 20px",
            backgroundColor: "#fff",
            color: "#231F20",
            border: "1px solid #eee",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        />
      </Box>
    </>
  );
}
