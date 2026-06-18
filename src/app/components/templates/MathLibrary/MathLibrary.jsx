"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Stack,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  IconButton,
  Box,
  Select,
  MenuItem,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import Lottie from "lottie-react";

import { Loader, ImageHandler } from "@/components/elements";
import { Config } from "@/src/app/constant";
import { locale } from "@/app/data/locale";
import { Auth } from "@/app/data/local";
import { Helpers, CategoryHelpers } from "@/app/utils";
import MathLibraryAPI from "@/app/data/api/MathLibraryAPI";
import ttsManager from "@/app/utils/TextToSpeechManager";
import lunaSilentAnimation from "@/assets/animations/Luna_正面走路_slient.json";
import lunaSpeakingAnimation from "@/assets/animations/Luna_正面走路_speaking.json";
import gsap from "gsap";

const MathLibrary = ({ initialAssets = [], initialYear }) => {
  const mainClassName = "template-math-library";

  // Get user year from redux or localStorage (navbar selection - source of truth)
  const reduxDataUser = useSelector((state) => state.mainLayout?.dataUser);
  const dataUser = reduxDataUser || Auth.getDataUser();
  const userYear = parseInt(dataUser?.year) || parseInt(Config.userYear) || 1;

  // selectedYear follows navbar; initialYear is only for knowing which assets we prefetched
  const [loader, setLoader] = useState(
    initialAssets?.length > 0 && initialYear === userYear ? false : true,
  );
  const [selectedYear, setSelectedYear] = useState(userYear);
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [assets, setAssets] = useState([]);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Refs
  const assetImageRef = useRef(null);
  const audioNavRef = useRef(null);
  const initialUsedRef = useRef(false);

  // Build categories from assets
  const buildCategoriesFromAssets = (allYearAssets, year) => {
    const activeCategoryIds = [
      ...new Set(allYearAssets.map((a) => parseInt(a.category_id))),
    ];
    const dataCategory = CategoryHelpers.getRefactorCategory(year);
    const filteredList = [];
    if (dataCategory && Array.isArray(dataCategory)) {
      dataCategory.forEach((item) => {
        const catId = parseInt(item.id);
        if (activeCategoryIds.includes(catId)) {
          filteredList.push({ id: catId, label: item.label });
        }
      });
    }
    return filteredList;
  };

  // Fetch all assets for the year and build valid categories
  useEffect(() => {
    const useInitialData =
      initialAssets?.length > 0 &&
      selectedYear === initialYear &&
      !initialUsedRef.current;

    if (useInitialData) {
      initialUsedRef.current = true;
      const filteredList = buildCategoriesFromAssets(
        initialAssets,
        selectedYear,
      );
      setCategories(filteredList);
      setAssets(initialAssets);
      if (filteredList.length > 0) {
        const firstCatId = filteredList[0].id;
        setSelectedCategoryId(firstCatId);
        setExpandedCategory(firstCatId);
      }
      setLoader(false);
      return;
    }

    const fetchYearData = async () => {
      setLoader(true);
      try {
        const res = await MathLibraryAPI.getAssets({
          year: selectedYear,
        });
        const allYearAssets = res?.payload?.data?.assets || [];
        const filteredList = buildCategoriesFromAssets(
          allYearAssets,
          selectedYear,
        );
        setCategories(filteredList);
        setAssets(allYearAssets);
        if (filteredList.length > 0) {
          const firstCatId = filteredList[0].id;
          setSelectedCategoryId(firstCatId);
          setExpandedCategory(firstCatId);
        } else {
          setSelectedCategoryId(null);
          setExpandedCategory(null);
        }
      } catch (error) {
        console.error("Failed to fetch year data:", error);
        setCategories([]);
        setAssets([]);
      } finally {
        setLoader(false);
      }
    };

    fetchYearData();
  }, [selectedYear, initialAssets, initialYear]);

  // Current filtered assets based on selection
  const currentCategoryAssets = assets.filter(
    (a) => parseInt(a.category_id) === selectedCategoryId,
  );
  const currentAsset = currentCategoryAssets[currentAssetIndex];

  // Reset asset index when category changes
  useEffect(() => {
    setCurrentAssetIndex(0);
  }, [selectedCategoryId]);

  // Asset Pop Animation
  // Reset loading state on index change
  useEffect(() => {
    setIsImageLoading(true);
  }, [selectedCategoryId]);

  // Windowed preload: only images around the current slide (smooth when sliding fast, low first-load cost)
  const WINDOW_BEHIND = 2;
  const WINDOW_AHEAD = 6;
  useEffect(() => {
    if (currentCategoryAssets.length === 0) return;
    const start = Math.max(0, currentAssetIndex - WINDOW_BEHIND);
    const end = Math.min(
      currentCategoryAssets.length - 1,
      currentAssetIndex + WINDOW_AHEAD,
    );
    const toPreload = currentCategoryAssets.slice(start, end + 1);
    toPreload.forEach((asset) => {
      const img = new Image();
      img.src = asset.asset_url;
    });
  }, [selectedCategoryId, currentCategoryAssets, currentAssetIndex]);

  // Asset Pop Animation - Synchronized with Image Load
  useEffect(() => {
    if (!isImageLoading && assetImageRef.current && currentAsset) {
      gsap.fromTo(
        assetImageRef.current,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
      );
    }
  }, [isImageLoading, currentAsset, currentAssetIndex]);

  // Disable global scroll on mount
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleCategoryClick = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
    setSelectedCategoryId(categoryId);
  };

  const playNavigationSound = (type = "nav") => {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;

    const soundFile =
      type === "complete"
        ? "/sounds/Mission_Completed_Dashboard.mp3"
        : "/sounds/New_Avatar_Chosen_Dashboard.mp3";

    if (!audioNavRef.current) {
      audioNavRef.current = new Audio(soundFile);
    } else {
      // If the sound file is different, update the src
      const currentSrc = audioNavRef.current.src;
      if (!currentSrc.includes(soundFile)) {
        audioNavRef.current.src = soundFile;
      }
    }

    audioNavRef.current.currentTime = 0;
    audioNavRef.current.play().catch((err) => {
      console.error("Error playing navigation sound:", err);
    });
  };

  const handlePrevAsset = () => {
    if (currentAssetIndex > 0) {
      setCurrentAssetIndex((prev) => prev - 1);
      playNavigationSound("nav");
    }
  };

  const handleNextAsset = () => {
    // Check if we are at the last slide
    if (currentAssetIndex === currentCategoryAssets.length - 1) {
      // Play completion sound if user clicks next on the last slide (optional logic,
      // but usually completion sound plays when finishing.
      // If the button is disabled, this won't trigger.
      // If the user *just* arrived at the last slide, we might want to play it then?)
      // WAIT: The user request says "use the sound of ‘Mission Completed_Dashboard’ ... for ‘completing the whole category’"
      // Usually this means when they arrive at the last slide, OR when they click a 'Finish' button.
      // Since the button is disabled at the end, I will trigger this sound when we *transition* to the last slide.
      // actually, let's keep it simple: separate prev/next logic.
    }

    if (currentAssetIndex < currentCategoryAssets.length - 1) {
      const nextIndex = currentAssetIndex + 1;
      setCurrentAssetIndex(nextIndex);

      // If the *new* index is the last one, play complete sound
      if (nextIndex === currentCategoryAssets.length - 1) {
        playNavigationSound("complete");
      } else {
        playNavigationSound("nav");
      }
    }
  };

  const handleSpeak = () => {
    if (!currentAsset) return;

    const text = `This is a ${currentAsset.name}. ${currentAsset.description || ""}`;

    if (isSpeaking) {
      ttsManager.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      ttsManager.speak(text, {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  return (
    <Stack className={mainClassName}>
      <Loader isOpen={loader} />

      <Stack direction="row" className={mainClassName + "-container"}>
        {/* Sidebar */}
        <Stack className={mainClassName + "-sidebar"}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            className={mainClassName + "-sidebar-header"}
            mb={2}
          >
            <Typography className={mainClassName + "-sidebar-title"}>
              {locale({ en: "Math Chapters", zh: "數學章節" })}
            </Typography>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              size="small"
              className={mainClassName + "-year-select"}
              sx={{
                borderRadius: "10px",
                bgcolor: "#f5f5f5",
                "& .MuiSelect-select": {
                  py: 0.5,
                  fontSize: "14px",
                  fontWeight: 600,
                },
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((year) => (
                <MenuItem key={year} value={year}>
                  {locale({ en: `Year ${year}`, zh: `${year} 年級` })}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          <List component="nav" className={mainClassName + "-sidebar-list"}>
            {categories.map((category) => (
              <React.Fragment key={category.id}>
                <ListItemButton
                  onClick={() => handleCategoryClick(category.id)}
                  className={
                    mainClassName +
                    "-sidebar-item" +
                    (selectedCategoryId === category.id ? " active" : "")
                  }
                >
                  <ListItemText
                    primary={category.label}
                    className={Helpers.fontZH()}
                  />
                  {expandedCategory === category.id ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </ListItemButton>
              </React.Fragment>
            ))}
          </List>
        </Stack>

        {/* Main Content */}
        <Stack className={mainClassName + "-content"}>
          {currentAsset ? (
            <>
              {/* Mascot Speech Bubble */}
              <Stack
                direction="row"
                alignItems="flex-end"
                className={mainClassName + "-mascot-row"}
              >
                <Box className={mainClassName + "-mascot-animation"}>
                  <Lottie
                    animationData={
                      isSpeaking ? lunaSpeakingAnimation : lunaSilentAnimation
                    }
                    loop={true}
                    style={{ width: 220, height: 220 }}
                  />
                </Box>
                <Stack className={mainClassName + "-speech-bubble"}>
                  <Typography className={Helpers.fontZH()}>
                    This is a <strong>{currentAsset.name}</strong>.{" "}
                    {currentAsset.description || ""}
                  </Typography>
                  <IconButton
                    onClick={handleSpeak}
                    className={
                      mainClassName +
                      "-speaker-icon" +
                      (isSpeaking ? " active" : "")
                    }
                  >
                    <VolumeUpIcon />
                  </IconButton>
                </Stack>
              </Stack>

              {/* Asset Image Card */}
              <Stack className={mainClassName + "-asset-card"}>
                <Box className={mainClassName + "-asset-image-wrapper"}>
                  {isImageLoading && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        width: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                    >
                      <Loader isOpen={true} />
                    </Box>
                  )}
                  <img
                    ref={assetImageRef}
                    src={currentAsset.asset_url}
                    alt={currentAsset.name}
                    className={mainClassName + "-asset-image"}
                    onLoad={() => setIsImageLoading(false)}
                    style={{ opacity: isImageLoading ? 0 : 1 }}
                  />
                </Box>

                {/* Navigation */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  className={mainClassName + "-asset-nav"}
                >
                  <IconButton
                    onClick={handlePrevAsset}
                    disabled={currentAssetIndex === 0}
                    className={mainClassName + "-nav-btn"}
                  >
                    <ChevronLeftIcon />
                  </IconButton>

                  <Typography className={mainClassName + "-slide-indicator"}>
                    Slide {currentAssetIndex + 1} /{" "}
                    {currentCategoryAssets.length}
                  </Typography>

                  <IconButton
                    onClick={handleNextAsset}
                    disabled={
                      currentAssetIndex === currentCategoryAssets.length - 1
                    }
                    className={mainClassName + "-nav-btn"}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </>
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              className={mainClassName + "-empty-state"}
            >
              <Typography>
                {locale({
                  en: "No assets found for this category.",
                  zh: "此類別沒有資產。",
                })}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default MathLibrary;
