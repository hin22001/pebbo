"use client";
import React from "react";
import { Modal, Box, Stack, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import { ImageHandler } from "../image";

export default function AvatarSelectionModal({
  isOpen,
  onClose,
  currentAvatar,
  displayLevel,
  onSelectAvatar,
  titleText,
  mainClassName = "dashboard-page",
  avatarSize = 85,
  gridColumns = 5,
  modalWidth = 700,
  titleFontSize = 20,
}) {
  const profileList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes avatarGlow {
              0%, 100% {
                box-shadow: 0 0 20px rgba(130, 100, 255, 0.6);
              }
              50% {
                box-shadow: 0 0 30px rgba(130, 100, 255, 0.9), 0 0 50px rgba(130, 100, 255, 0.4);
              }
            }
            @keyframes shimmer {
              0% {
                left: -100%;
              }
              100% {
                left: 200%;
              }
            }
            .avatar-hover-shine:hover::before {
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
      <Modal
        open={isOpen}
        onClose={onClose}
        aria-labelledby="avatar-selection-modal-title"
        aria-describedby="avatar-selection-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: modalWidth,
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "#fff",
            borderRadius: "20px",
            outline: "none",
          }}
        >
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
                onClick={onClose}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Stack>
          </Stack>
          <Stack p={5}>
            <Typography
              fontWeight={600}
              fontSize={titleFontSize}
              mb={3}
              sx={{
                textAlign: "center !important",
                width: "100%",
                fontFamily: "'Advercase', serif !important",
              }}
            >
              {titleText}
            </Typography>
            <Stack
              sx={{
                display: "grid !important",
                gridTemplateColumns: `repeat(${gridColumns}, 1fr) !important`,
                gap: 2,
                justifyContent: "center",
                marginTop: "2rem",
              }}
            >
              {profileList?.map((val, i) => {
                const isUnlocked = val <= displayLevel;
                const isSelected = val === parseInt(currentAvatar);

                return (
                  <Stack
                    key={i}
                    onClick={() => {
                      if (isUnlocked) {
                        onSelectAvatar(val);
                      }
                    }}
                    sx={{
                      cursor: isUnlocked ? "pointer" : "not-allowed",
                      position: "relative",
                      opacity: isUnlocked ? 1 : 0.5,
                      filter: isUnlocked ? "none" : "grayscale(70%)",
                      border: isUnlocked
                        ? isSelected
                          ? "6px solid #8264ff !important"
                          : "3px solid transparent"
                        : "3px solid transparent",
                      borderRadius: "1rem !important",
                      transition: "all 0.3s ease",
                      overflow: "hidden",
                      width: "100%",
                      aspectRatio: "200 / 250 !important",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: Math.round(avatarSize * 1.25),
                      ...(isUnlocked &&
                        isSelected && {
                          boxShadow:
                            "0 8px 16px rgba(130, 100, 255, 0.4), 0 4px 8px rgba(130, 100, 255, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
                          background:
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(130, 100, 255, 0.1) 100%)",
                        }),
                      ...(isUnlocked && {
                        "&:hover": {
                          boxShadow: "0 0 20px rgba(130, 100, 255, 0.6)",
                          animation: "avatarGlow 2s ease-in-out infinite",
                          transform: "scale(1.05)",
                        },
                      }),
                    }}
                    className={`${mainClassName}-profile-select-ava${
                      isSelected ? "-active" : ""
                    }${!isUnlocked ? "-locked" : ""} ${
                      isUnlocked ? "avatar-hover-shine" : ""
                    }`}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        paddingTop: `${Math.round(avatarSize * 0.25)}px`,
                        "& .elements-image-handler": {
                          width: "100% !important",
                          height: "100% !important",
                        },
                        "& .elements-image-handler-image": {
                          width: "100% !important",
                          height: "100% !important",
                          objectFit: "contain !important",
                        },
                      }}
                    >
                      <ImageHandler
                        src={require(
                          `@/images/illustration/illustration-profile${val}.svg`,
                        )}
                        alt="ava"
                        width={avatarSize}
                        height={Math.round(avatarSize * 1.25)}
                        borderRadius="1rem"
                        overridePercent={100}
                      />
                    </Box>
                    {!isUnlocked && (
                      <Stack
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0, 0, 0, 0.4)",
                          borderRadius: "20px",
                        }}
                      >
                        <LockIcon
                          sx={{
                            color: "#fff",
                            fontSize: "28px",
                            mb: 0.5,
                          }}
                        />
                        <Typography
                          sx={{
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: 600,
                            textAlign: "center",
                            px: 0.5,
                          }}
                        >
                          Requires level {val}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}
