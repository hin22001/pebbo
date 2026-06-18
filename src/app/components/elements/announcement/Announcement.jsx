"use client";
import React, { useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

export default function Announcement() {
  const [isOpen, setIsOpen] = React.useState(false);
  const mainClassName = "elements-announcement";

  const getIsOpen = () => {
    const now = new Date();
    const prevCloseAnnouncement = localStorage.getItem("prevCloseAnnouncement");

    if (prevCloseAnnouncement) {
      const prevCloseTime = new Date(prevCloseAnnouncement);
      const timeDifference = now - prevCloseTime;

      const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;

      if (timeDifference >= twentyFourHoursInMilliseconds) {
        // api
        setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    const now = new Date();
    localStorage.setItem("prevCloseAnnouncement", now);
    setIsOpen(false);
  };

  useEffect(() => {
    // getIsOpen();
  }, []);

  if (isOpen) {
    return (
      <div className={mainClassName + "-wrapper"}>
        <div className={mainClassName + "-title"}>
          Service maintenance is underway.
          <span onClick={handleClose} className={mainClassName + "-learn-more"}>
            Learn more
          </span>
        </div>
        <div className={mainClassName + "-close"}>
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </div>
      </div>
    );
  } else {
    return null;
  }
}
