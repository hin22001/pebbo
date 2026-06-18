import React, { useState, useEffect } from "react";
import { Avatar, Button, Typography, Tooltip, IconButton } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { locale } from "@/locale";
import ImageHandler from "@/elements/image/ImageHandler";

/**
 * Reusable UserCard component for headers
 * Supports different user types (student, teacher, admin) with configurable features
 */
const UserCard = ({
  // Core user data
  dataUser,
  head2,

  // Styling
  className = "",
  mainClassName = "",

  // Event handlers
  onUserCardClick,

  // Feature flags
  showMoreButton = false,
  showSubscriptionStatus = false,
  truncateName = false,

  // Custom role override (for admin/teacher hardcoded roles)
  customRoleText = null,

  // Additional props
  tooltipTitle = null,
  isPaid = false,
}) => {
  // State to track current avatar
  const [avatarNumber, setAvatarNumber] = useState(() => {
    // Priority: DB value > localStorage > fallback 1
    const dbAva =
      parseInt(dataUser?.profile_image) || parseInt(dataUser?.image);
    if (dbAva) return dbAva;

    if (typeof window !== "undefined") {
      const avaLocal = localStorage.getItem("ava");
      if (avaLocal) {
        return parseInt(avaLocal) || 1;
      }
    }
    return 1;
  });

  // Listen for localStorage changes and update avatar
  useEffect(() => {
    const updateAvatar = () => {
      // Priority: DB value > localStorage > fallback 1
      const dbAva =
        parseInt(dataUser?.profile_image) || parseInt(dataUser?.image);
      const localAva =
        typeof window !== "undefined" ? localStorage.getItem("ava") : null;

      const finalAva = dbAva || (localAva ? parseInt(localAva) : 1);

      if (finalAva !== avatarNumber) {
        setAvatarNumber(finalAva);
      }
    };

    // Update avatar on mount or when dataUser changes
    updateAvatar();

    // Listen for storage events (when localStorage changes in other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === "ava") {
        updateAvatar();
      }
    };

    // Also listen for a custom event if we want "instant" updates in the same tab
    const handleCustomEvent = (e) => {
      if (e.detail?.ava) {
        setAvatarNumber(parseInt(e.detail.ava));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("avaUpdated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("avaUpdated", handleCustomEvent);
    };
  }, [avatarNumber, dataUser?.profile_image, dataUser?.image]);

  // Generate tooltip title
  const finalTooltipTitle =
    tooltipTitle || `Open settings for ${dataUser?.name || ""}`;

  // Format user name
  const getFormattedName = () => {
    const name = dataUser?.name || "";
    if (truncateName && name.length > 15) {
      return name.slice(0, 13) + "...";
    }
    return name;
  };

  // Get avatar image source
  const getAvatarSrc = () => {
    // Map avatar numbers to require statements
    const avatarMap = {
      1: require("@/images/illustration/illustration-profile1.svg"),
      2: require("@/images/illustration/illustration-profile2.svg"),
      3: require("@/images/illustration/illustration-profile3.svg"),
      4: require("@/images/illustration/illustration-profile4.svg"),
      5: require("@/images/illustration/illustration-profile5.svg"),
      6: require("@/images/illustration/illustration-profile6.svg"),
      7: require("@/images/illustration/illustration-profile7.svg"),
      8: require("@/images/illustration/illustration-profile8.svg"),
      9: require("@/images/illustration/illustration-profile9.svg"),
      10: require("@/images/illustration/illustration-profile10.svg"),
    };
    return avatarMap[avatarNumber] || avatarMap[1];
  };

  // Build final className
  const buttonClassName =
    `${mainClassName}-user-button card-button ${className}`.trim();

  return (
    <>
      <Tooltip title={finalTooltipTitle}>
        <Button
          className={buttonClassName}
          onClick={(event) =>
            onUserCardClick?.({
              type: "click-user-card",
              event,
            })
          }
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textAlign: "left",
          }}
        >
          {typeof window !== "undefined" ? (
            <ImageHandler
              src={getAvatarSrc()}
              alt={dataUser?.name || "User Avatar"}
              width={40}
              height={40}
              borderRadius="50%"
            />
          ) : (
            <Avatar alt={dataUser?.name} src={dataUser?.image} />
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.1,
            }}
          >
            <Typography
              className="text-title"
              variant="h6"
              sx={{
                fontFamily: "'Advercase', serif !important",
                letterSpacing: "0.07rem",
              }}
            >
              {getFormattedName()}
            </Typography>
          </div>
        </Button>
      </Tooltip>

      {showMoreButton && (
        <IconButton
          onClick={(event) =>
            onUserCardClick?.({
              type: "click-user-card",
              event,
            })
          }
        >
          <MoreVert sx={{ color: "#A6A8AB" }} />
        </IconButton>
      )}
    </>
  );
};

export default UserCard;
