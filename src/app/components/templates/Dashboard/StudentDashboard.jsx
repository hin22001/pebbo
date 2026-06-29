"use client";
import {
  Card,
  Select,
  Stack,
  Typography,
  MenuItem,
  Modal,
  Box,
  IconButton,
  Skeleton,
  Button as ButtonMUI,
} from "@mui/material";
import React, { Component, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Alert,
  Button,
  ImageHandler,
  Loader,
  Congratulations,
  StreakCelebration,
  LevelUpCelebration,
  AvatarSelectionModal,
  OnboardingTour,
  AppReportDrawer,
} from "../../elements";

import { LocalData, Auth } from "@/src/app/data/local";
import { getDataHead } from "@/src/app/data/head";
import { locale } from "@/src/app/data/locale";
import { CustomSelect } from "../../modules";
import { ClassroomList } from "../ClassroomList";

import { StreakCard } from "../../streak/streak-card";
import { DailyStreakPopup } from "../../streak/daily-streak-popup";
import { TimerModule } from "../../modules/timer-module";
import Helpers from "../../../utils/Helpers";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import UserAPI from "../../../data/api/UserAPI";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import LoginAPI from "../../../data/api/LoginAPI";
import gsap from "gsap";
import { AnimationController } from "../../../utils/AnimationController";
import ConfettiManager from "../../../utils/ConfettiManager";
import useDashboardStore from "../../../stores/useDashboardStore";
import useDashboardSounds from "./hooks/useDashboardSounds";
import DashboardOnboardingTour from "./DashboardOnboardingTour";
import DashboardModals from "./DashboardModals";
import DashboardProfileCard from "./DashboardProfileCard";
import DashboardTodoSection from "./DashboardTodoSection";
import DashboardActivityCards from "./DashboardActivityCards";

export default function ClasRoom(props) {
  const { reconcilePayment, attemptSubscribe, initialDashboardData } = props;

  const reduxDataSummary = useSelector(
    (state) => state.mainLayout?.dataSummary,
  );
  const reduxDataUser = useSelector((state) => state.mainLayout?.dataUser);

  const seedStudentProfileFromDash = (dash) => {
    const profileRaw = dash?.profile || null;
    if (!profileRaw) return null;
    return {
      ...profileRaw,
      name:
        [profileRaw.first_name, profileRaw.last_name].filter(Boolean).join(" ") ||
        "Student",
    };
  };

  const seededProfile = seedStudentProfileFromDash(initialDashboardData);
  const seededPaying =
    seededProfile?.paying ??
    reconcilePayment?.payload?.data?.paying ??
    null;

  const [loader, setLoader] = useState(false);
  const [dataUser, setDataUser] = useState(seededProfile || null);
  const [dataSummary, setDataSummary] = useState(
    initialDashboardData?.summary ?? null,
  );
  const [quizList, setQuizList] = useState(initialDashboardData?.quizzes ?? []);
  const [studentProfile, setStudentProfile] = useState(seededProfile || null);
  const [ava, setAva] = useState(1);
  const [checkedTodo, setCheckedTodo] = useState([]);
  const [events, setEvents] = useState([]);
  const [fetchedYear, setFetchedYear] = useState([]);
  const [modal, setModal] = useState(
    reconcilePayment?.payload?.data?.paying === false,
  );
  const [avatarModal, setAvatarModal] = useState(false);
  const [consecutiveDays, setConsecutiveDays] = useState(2);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [xpProgressValue, setXpProgressValue] = useState(0);
  const [xpNumberValue, setXpNumberValue] = useState(0);
  const [showShimmer, setShowShimmer] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(1);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [showLevelUpCelebration, setShowLevelUpCelebration] = useState(false);
  const [showAvatarUnlock, setShowAvatarUnlock] = useState(false);
  const [unlockedAvatarLevel, setUnlockedAvatarLevel] = useState(null);
  const [runTour, setRunTour] = useState(false);
  const [missionMusicPlayed, setMissionMusicPlayed] = useState(false);
  const [showAppReportDrawer, setShowAppReportDrawer] = useState(false);
  const [pendingStreakData, setPendingStreakData] = useState(null);

  const progressBarRef = useRef(null);
  const xpNumberRef = useRef(null);
  const statsIconRefs = useRef({});
  const statsCounterRefs = useRef({});
  const buttonRefs = useRef({});
  const todoContainerRef = useRef(null);
  const todoRowRefs = useRef([]);
  const levelElementRef = useRef(null);
  const starElementRef = useRef(null);
  const progressFillRef = useRef(null);
  const questionIconRef = useRef(null);
  const reportIconRef = useRef(null);
  const statsContainerRef = useRef(null);
  const streakCardRef = useRef(null);

  const { fetchDashboard, invalidateCache, primeDashboard } = useDashboardStore();
  const usedInitialRef = useRef(false);
  const initialDashboardRef = useRef(initialDashboardData);

  const {
    playStartExerciseSound,
    playStreakSound,
    playLevelUpSound,
    playAvatarChosenSound,
    playMissionCompletedSound,
  } = useDashboardSounds();

  const triggerStreakCeremony = (streakData) => {
    if (!streakData) return;
    const { new_streak, coins_awarded, total_coins } = streakData;

    setConsecutiveDays(new_streak);

    if (statsIconRefs.current.fire) {
      AnimationController.animateStreakIncrement(
        statsIconRefs.current.fire,
        null,
        null,
        new_streak,
      );
    }

    // The dashboard payload's total_coins ALREADY includes today's streak
    // reward (the RPC inserts the coin row before reading the total), so we
    // animate UP TO that authoritative total rather than adding on top —
    // otherwise the reward would be double-counted.
    const coinTarget = Auth.computeDisplayCoins(total_coins);
    if (window.triggerCoinIncrement && coins_awarded > 0) {
      window.triggerCoinIncrement(coins_awarded, coinTarget ?? undefined);
    } else if (coinTarget != null) {
      Auth.syncCoinBalance(coinTarget);
    }

    playStreakSound();

    setShowStreakPopup(true);

    if (new_streak === 7) {
      const streakContainer = document.querySelector(".daily-streak-reward");
      const trophyElement = document.querySelector(
        '[alt*="trophy"], [alt*="Trophy"]',
      );
      const circleElements = document.querySelectorAll(
        ".streak-circle, .day-circle",
      );

      ConfettiManager.celebrateStreakMilestone(
        streakContainer || document.body,
      );

      if (streakContainer || trophyElement) {
        AnimationController.celebrateStreakMilestone(
          circleElements.length > 0 ? Array.from(circleElements) : null,
          trophyElement,
        );
      }
      setShowStreakCelebration(true);
    }
  };

  useEffect(() => {
    const handleOnboardingFinished = () => {
      if (pendingStreakData && !isInitializing) {
        const waitForLoaderToClose = () => {
          const loaderModal = document.querySelector(
            ".elements-custom-loader, .modules-modal-screen .MuiModal-backdrop",
          );
          if (loaderModal) {
            setTimeout(waitForLoaderToClose, 300);
          } else {
            setTimeout(() => {
              triggerStreakCeremony(pendingStreakData);
              setPendingStreakData(null);
            }, 800);
          }
        };
        setTimeout(waitForLoaderToClose, 500);
      }
    };

    window.addEventListener(
      "pebbo-onboarding-finished",
      handleOnboardingFinished,
    );
    return () =>
      window.removeEventListener(
        "pebbo-onboarding-finished",
        handleOnboardingFinished,
      );
  }, [pendingStreakData, isInitializing]);

  useEffect(() => {
    if (pendingStreakData && !isInitializing) {
      const introCompleted = localStorage.getItem("intro_completed") === "true";

      if (introCompleted) {
        let cancelled = false;
        const waitForLoaderToClose = () => {
          if (cancelled) return;

          const loaderVisible = document.querySelector(
            ".elements-custom-loader, .modules-modal-screen",
          );

          if (loaderVisible) {
            setTimeout(waitForLoaderToClose, 300);
          } else {
            setTimeout(() => {
              if (!cancelled) {
                triggerStreakCeremony(pendingStreakData);
                setPendingStreakData(null);
              }
            }, 800);
          }
        };

        setTimeout(waitForLoaderToClose, 800);
        return () => {
          cancelled = true;
        };
      }
    }
  }, [pendingStreakData, isInitializing]);

  const incrementStreak = () => {
    triggerStreakCeremony({
      new_streak: Math.min(7, consecutiveDays + 1),
      coins_awarded: Math.min(7, consecutiveDays + 1) * 5,
      is_new_checkin: true,
    });
  };

  const handleQuestionIconHover = (isHovering) => {
    if (!questionIconRef.current) return;

    if (isHovering) {
      gsap.to(questionIconRef.current, {
        rotation: 180,
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(questionIconRef.current, {
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleReportIconHover = (isHovering) => {
    if (!reportIconRef.current) return;

    if (isHovering) {
      gsap.to(reportIconRef.current, {
        rotation: 15,
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(reportIconRef.current, {
        rotation: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const testTodoCelebration = () => {
    if (todoContainerRef.current) {
      const todoRows = todoRowRefs.current.filter((ref) => ref !== null);
      AnimationController.celebrateTodoCompletion(
        todoContainerRef.current,
        todoRows,
      );
    } else {
    }
  };

  const testLevelUpCelebration = () => {
    if (levelElementRef.current) {
      setXpProgressValue(100);

      const animateTo100 = (start, end, duration) => {
        const startTime = Date.now();
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const currentValue = Math.floor(start + (end - start) * progress);
          setXpNumberValue(currentValue);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      };

      animateTo100(xpNumberValue, 100, 1500);

      setTimeout(() => {
        const newLevelValue = displayLevel + 1;

        setDisplayLevel(newLevelValue);

        UserAPI.postCelebrateLevel(newLevelValue).catch((e) =>
          console.error("Test button DB update failed:", e),
        );

        if (progressFillRef.current) {
          progressFillRef.current.style.transition = "none";
        }

        setXpProgressValue(0);
        setXpNumberValue(0);
        setShowShimmer(false);

        setTimeout(() => {
          if (progressFillRef.current) {
            progressFillRef.current.style.transition =
              "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
          }
        }, 50);

        AnimationController.celebrateLevelUp(
          levelElementRef.current,
          starElementRef.current,
          null,
        );

        setShowLevelUpCelebration(true);

        playLevelUpSound();

        const newLevel = displayLevel + 1;
        if (newLevel <= 10) {
          setTimeout(() => {
            setUnlockedAvatarLevel(newLevel);
            setShowAvatarUnlock(true);
          }, 3000);
        }

        setTimeout(() => {
          setXpProgressValue(10);

          const animateTo10 = (start, end, duration) => {
            const startTime = Date.now();
            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const currentValue = Math.floor(start + (end - start) * progress);
              setXpNumberValue(currentValue);

              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            requestAnimationFrame(animate);
          };

          animateTo10(0, 10, 1500);

          setTimeout(() => {
            setShowShimmer(true);
            setTimeout(() => {
              setShowShimmer(false);
            }, 1500);
          }, 1500);
        }, 100);
      }, 1500);
    } else {
    }
  };
  const head = getDataHead({ name: "headDashboardPage" });
  const router = useRouter();

  const updateAva = async (val) => {
    localStorage.setItem("ava", val);
    setAva(val);
    setAvatarModal(false);

    playAvatarChosenSound();

    window.dispatchEvent(
      new CustomEvent("avaUpdated", { detail: { ava: val } }),
    );

    try {
      await UserAPI.postUpdateProfileImage(val);
    } catch (error) {
      console.error("🚀 Dashboard - Failed to update avatar in DB:", error);
    }

    Helpers.openSnackbar({
      name: "dataSuccessfullyEdited",
      autoHideDuration: 3000,
    });
  };

  let currentYear = dayjs().year();

  const mainClassName = "dashboard-page";

  const init = async () => {
    if (isInitializing) {
      return;
    }

    const hasInitialDashboardData =
      !usedInitialRef.current && Boolean(initialDashboardRef.current);

    setIsInitializing(true);

    if (!hasInitialDashboardData) {
      setLoader(true);
    }

    const dataUser = reduxDataUser || Auth.getDataUser();
    setDataUser((prev) => prev || dataUser);

    let dashData = null;

    if (hasInitialDashboardData) {
      usedInitialRef.current = true;
      dashData = initialDashboardRef.current;
      primeDashboard(dashData);

      // Seed profile immediately so dashboard never flashes blank on first nav.
      const seeded = seedStudentProfileFromDash(dashData);
      if (seeded) {
        setStudentProfile(seeded);
        setDataUser(seeded);
      }
    } else {
      dashData = await fetchDashboard(dataUser?.year);
    }

    if (!dashData) {
      setLoader(false);
      setIsInitializing(false);
      // If we failed to get data (likely 403 from new assertPaying), show the payment modal
      if (!dataUser?.paying) {
        setModal(true);
      }
      return;
    }

    setLoader(false);

    // Authoritative coin total from the dashboard payload (DB source of truth).
    const dbTotalCoins = dashData?.profile?.total_coins;

    // Reconcile the navbar star chip to the authoritative DB stars on every
    // load (stars are a stored column; no ceremony/animation to coordinate).
    const dbStars = dashData?.profile?.stars;
    if (dbStars != null) Auth.syncStars(dbStars);

    const streakData = dashData.streak;
    if (streakData) {
      const { new_streak, is_new_checkin } = streakData;
      setConsecutiveDays(new_streak);

      const hasSeenStreakPopup =
        localStorage.getItem("hasSeenStreakPopup") === "true";
      if (is_new_checkin || !hasSeenStreakPopup) {
        console.log(
          "⏳ Streak popup needed - queuing ceremony until loading/onboarding finished",
        );
        // Carry the authoritative total so the ceremony lands the coin chip on
        // the DB value instead of blindly adding the reward.
        setPendingStreakData({ ...streakData, total_coins: dbTotalCoins });
      } else {
        // No ceremony will run — reconcile the chip to the DB total directly so
        // it never lags behind (this is what fixes the 579-vs-586 drift).
        const coinTarget = Auth.computeDisplayCoins(dbTotalCoins);
        if (coinTarget != null) Auth.syncCoinBalance(coinTarget);
      }
    } else {
      const coinTarget = Auth.computeDisplayCoins(dbTotalCoins);
      if (coinTarget != null) Auth.syncCoinBalance(coinTarget);
    }

    let dataSummary = reduxDataSummary || dashData.summary || null;
    if (!dataSummary) {
      try {
        const summaryRes = await UserAPI.getSummary();
        dataSummary = summaryRes?.payload?.data ?? null;
      } catch {
        dataSummary = null;
      }
    }
    if (dataSummary) {
      setDataSummary(dataSummary);
    }
    const currentLevel =
      dataSummary?.total_fully_accurate !== undefined
        ? Math.floor(dataSummary.total_fully_accurate / 100) + 1
        : 1;
    setDisplayLevel(currentLevel);

    if (dashData.quizzes && dashData.quizzes.length > 0) {
      setQuizList(dashData.quizzes);
    }

    if (dashData.reports && dashData.reports.length > 0) {
      const newEvents = dashData.reports.map((item) => ({
        start: item?.date,
        year: item?.year,
        title: item?.subject,
      }));
      setEvents(newEvents);
      setFetchedYear([dayjs().year()]);
    }

    const studentData = seedStudentProfileFromDash(dashData) || null;
    setStudentProfile(studentData);
    setDataUser(studentData || dataUser);

    const profileAva = studentData?.profile_image;
    let finalAva = 1;

    if (profileAva) {
      console.log(`🚀 Dashboard - Syncing avatar from profile: ${profileAva}`);
      finalAva = parseInt(profileAva);
    } else {
      const localAva = localStorage.getItem("ava");
      if (localAva) {
        finalAva = parseInt(localAva);
      }
    }

    if (finalAva > currentLevel) {
      console.log(
        `🚀 Dashboard - Avatar ${finalAva} is locked for level ${currentLevel}, falling back.`,
      );
      finalAva = currentLevel >= 1 ? currentLevel : 1;
    }

    setAva(finalAva);
    localStorage.setItem("ava", finalAva.toString());

    const lastCelebratedLevel = studentData?.last_celebrated_level || 1;
    if (currentLevel > lastCelebratedLevel) {
      console.log(
        `🎉 Persistent Level Up detected! ${lastCelebratedLevel} -> ${currentLevel}`,
      );

      setTimeout(() => {
        if (levelElementRef.current) {
          AnimationController.celebrateLevelUp(
            levelElementRef.current,
            starElementRef.current,
            null,
          );

          setShowLevelUpCelebration(true);
          playLevelUpSound();

          UserAPI.postCelebrateLevel(currentLevel)
            .then(() => {
              invalidateCache();
            })
            .catch((err) => {
              console.error("Failed to update last_celebrated_level:", err);
            });
        }
      }, 1500);
    }

    const now = new Date();

    const todayStr = now.toISOString().split("T")[0];
    const dbTodoDate = studentData?.last_todo_date;
    const dbTodoList = studentData?.todo_list || [];

    let activeTodoList = dbTodoList;

    if (dbTodoDate !== todayStr) {
      activeTodoList = [];
      UserAPI.postUpdateTodos([], todayStr)
        .then(() => invalidateCache())
        .catch((err) => console.error("Failed to reset todos in DB:", err));
    }

    setCheckedTodo(activeTodoList);

    let checkedTodo_ = localStorage.getItem("checkedTodo");

    if (checkedTodo_ && checkedTodo_ !== "") {
      try {
        const dataTodo = JSON.parse(checkedTodo_);
        const todoDate = new Date(dataTodo?.date);
        const isTodayTodo = todayStr === todoDate?.toISOString().split("T")[0];

        if (isTodayTodo && dataTodo?.list) {
          const merged = Array.from(
            new Set([...activeTodoList, ...dataTodo.list]),
          );
          if (merged.length > activeTodoList.length) {
            setCheckedTodo(merged);
          }
        }
      } catch (e) {
        console.error("Error parsing local checkedTodo:", e);
      }
    }

    let prevDate = localStorage.getItem("checkin");

    if (!prevDate) {
      localStorage.setItem("checkin", now);
      prevDate = now;
    } else {
      prevDate = new Date(prevDate);
      if (now.toDateString() !== prevDate.toDateString()) {
        localStorage.setItem("checkin", now);
        prevDate = now;
      }
    }

    const startTimeHours = prevDate.getHours();
    const startTimeMinutes = prevDate.getMinutes();
    const startArray = [
      Math.floor(startTimeHours / 10),
      startTimeHours % 10,
      Math.floor(startTimeMinutes / 10),
      startTimeMinutes % 10,
    ];

    const endDate = new Date(prevDate.getTime() + 20 * 60 * 1000);
    const endTimeHours = endDate.getHours();
    const endTimeMinutes = endDate.getMinutes();
    const endArray = [
      Math.floor(endTimeHours / 10),
      endTimeHours % 10,
      Math.floor(endTimeMinutes / 10),
      endTimeMinutes % 10,
    ];

    setIsInitializing(false);
  };

  const updateLiveTimer = () => {
    const now = new Date();
    let prevDate = new Date(localStorage.getItem("checkin"));

    const timeDifference = Math.abs(now - prevDate);
    const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
    const seconds = Math.floor((timeDifference / 1000) % 60);

    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    const percentageOfTwentyMinutes = Math.min((totalMinutes / 20) * 100, 100);
  };

  const getTimeOfDay = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return "morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "afternoon";
    } else {
      return "night";
    }
  };

  const isTodoChecked = (val) => {
    const strVal = String(val);
    return checkedTodo?.some((e) => String(e) === strVal);
  };

  const todoClick = (val, url) => {
    if (url === "/question/exercise") {
      playStartExerciseSound();
    }

    if (!isTodoChecked(val)) {
      const checkedTodo_ = [...checkedTodo, val];

      setCheckedTodo(checkedTodo_);

      const todayStr = new Date().toISOString().split("T")[0];
      UserAPI.postUpdateTodos(checkedTodo_, todayStr)
        .then(() => invalidateCache())
        .catch((err) => console.error("Failed to sync todos to DB:", err));

      localStorage.setItem(
        "checkedTodo",
        JSON.stringify({ list: checkedTodo_, date: new Date() }),
      );
    }

    router.push(url);
  };

  const handleStatHover = (statType) => {
    const iconRef = statsIconRefs.current[statType];
    const counterRef = statsCounterRefs.current[statType];

    if (iconRef) {
      AnimationController.animateStatsIcon(iconRef);
    }

    if (counterRef && dataSummary) {
      let value = 0;
      let isPercentage = false;

      switch (statType) {
        case "submissions":
          value = dataSummary?.total_completed || 0;
          break;
        case "accuracy":
          value = dataSummary?.average_accuracy
            ? dataSummary.average_accuracy * 100
            : 0;
          isPercentage = true;
          break;
        case "correct":
          value = dataSummary?.total_fully_accurate || 0;
          break;
      }

      console.log(
        `🎯 Animating counter for ${statType} from 0 to ${value}${isPercentage ? "%" : ""}`,
      );

      if (isPercentage) {
        gsap.set(counterRef, { textContent: "0.00%" });
        AnimationController.animateCounterPercentage(counterRef, value);
      } else {
        gsap.set(counterRef, { textContent: 0 });
        AnimationController.animateCounter(counterRef, value);
      }
    }
  };

  const handleStatLeave = (statType) => {
    const iconRef = statsIconRefs.current[statType];

    if (iconRef) {
      AnimationController.resetStatsIcon(iconRef);
    }
  };

  const handleButtonClick = (buttonType, callback) => {
    const buttonRef = buttonRefs.current[buttonType];

    if (buttonRef) {
      AnimationController.animateButtonClick(buttonRef, callback);
    } else {
      console.log(
        `🎯 No ref found for button ${buttonType}, calling callback directly`,
      );
      callback();
    }

    if (buttonType === "startExercise") {
      playStartExerciseSound();
    }
  };

  useEffect(() => {
    init();

    const timerInterval = setInterval(updateLiveTimer, 1000);

    const contentMain = document.querySelector(".main-layout-content-main");
    if (contentMain) {
      contentMain.style.overflow = "hidden";
    }

    return () => {
      clearInterval(timerInterval);

      if (contentMain) {
        contentMain.style.overflow = "auto";
      }
    };
  }, []);

  useEffect(() => {
    const starsValue = dataUser?.stars;
    console.log(
      `🎯 XP Progress - Raw dataUser.stars: ${starsValue}, type: ${typeof starsValue}`,
    );

    if (starsValue !== undefined && starsValue !== null && starsValue !== "") {
      const starsNumber = parseInt(starsValue) || 0;
      const targetPercentage = starsNumber % 100;
      const targetXpNumber = starsNumber % 100;

      console.log(
        `🎯 XP Progress - starsNumber: ${starsNumber}, targetPercentage: ${targetPercentage}%, targetXpNumber: ${targetXpNumber}`,
      );

      setXpProgressValue(0);
      setXpNumberValue(0);
      setShowShimmer(false);

      setTimeout(() => {
        console.log(
          `🎯 XP Progress - animating to ${targetPercentage}% and ${targetXpNumber} XP`,
        );
        setXpProgressValue(targetPercentage);

        console.log(
          `🎯 XP Progress - animating number from 0 to ${targetXpNumber}`,
        );

        const animateNumber = (start, end, duration) => {
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(start + (end - start) * progress);
            setXpNumberValue(currentValue);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        };

        animateNumber(0, targetXpNumber, 1500);

        setTimeout(() => {
          setShowShimmer(true);

          setTimeout(() => {
            setShowShimmer(false);
          }, 1500);
        }, 1500);
      }, 3000);
    } else {
      setXpProgressValue(0);
      setXpNumberValue(0);
      setShowShimmer(false);
    }
  }, [dataUser?.stars]);

  useEffect(() => {
    const totalRequired = 2 + (quizList ? quizList.length : 0);
    const allChecked = checkedTodo.length >= totalRequired;

    const todayStr = new Date().toISOString().split("T")[0];
    const alreadyCelebratedToday =
      studentProfile?.last_celebrated_todo_date === todayStr;

    if (allChecked && !alreadyCelebratedToday && todoContainerRef.current) {
      UserAPI.postCelebrateTodos(todayStr).catch((err) =>
        console.error("Failed to mark todo celebration in DB:", err),
      );

      const todoRows = todoRowRefs.current.filter((ref) => ref !== null);
      if (todoRows.length > 0) {
        AnimationController.celebrateTodoCompletion(
          todoContainerRef.current,
          todoRows,
        );
      }
    }
  }, [checkedTodo]);

  useEffect(() => {
    const bothTodosChecked =
      checkedTodo.includes("exercise") && checkedTodo.includes("report");

    if (bothTodosChecked) {
      const today = new Date().toDateString();
      const missionMusicPlayedToday = localStorage.getItem(
        "missionMusicPlayedToday",
      );

      if (missionMusicPlayedToday !== today) {
        playMissionCompletedSound();
        localStorage.setItem("missionMusicPlayedToday", today);
        setMissionMusicPlayed(true);
      }
    } else {
      setMissionMusicPlayed(false);
    }
  }, [checkedTodo]);

  useEffect(() => {
    if (dataSummary?.total_fully_accurate !== undefined) {
      const currentLevel =
        Math.floor(dataSummary.total_fully_accurate / 100) + 1;
      setDisplayLevel(currentLevel);
    }
  }, [dataSummary?.total_fully_accurate]);

  useEffect(() => {
    if (dataSummary?.total_fully_accurate !== undefined) {
      const currentLevel =
        Math.floor(dataSummary.total_fully_accurate / 100) + 1;

      const dbLastCelebratedLevel = studentProfile?.last_celebrated_level;
      const localLastCelebratedLevel = parseInt(
        localStorage.getItem("lastCelebratedLevel") || "1",
      );

      const lastCelebratedLevel =
        dbLastCelebratedLevel !== undefined
          ? dbLastCelebratedLevel
          : localLastCelebratedLevel;

      console.log(
        `🎉 Level Check - currentLevel: ${currentLevel}, dbLastCelebratedLevel: ${dbLastCelebratedLevel}, lastCelebratedLevel: ${lastCelebratedLevel}, total_fully_accurate: ${dataSummary.total_fully_accurate}`,
      );

      if (currentLevel > lastCelebratedLevel && levelElementRef.current) {
        console.log(
          `🎉 Level Up! From ${lastCelebratedLevel} to ${currentLevel} - Triggering Celebration!`,
        );

        localStorage.setItem("lastCelebratedLevel", currentLevel);

        UserAPI.postCelebrateLevel(currentLevel).catch((err) =>
          console.error("Failed to mark level celebration in DB:", err),
        );

        setPreviousLevel(currentLevel);
        setDisplayLevel(currentLevel);

        AnimationController.celebrateLevelUp(
          levelElementRef.current,
          starElementRef.current,
          null,
        );

        setShowLevelUpCelebration(true);

        playLevelUpSound();

        if (currentLevel <= 10) {
          setTimeout(() => {
            setUnlockedAvatarLevel(currentLevel);
            setShowAvatarUnlock(true);
          }, 1000);
        }
      }
    }
  }, [
    dataSummary?.total_fully_accurate,
    studentProfile?.last_celebrated_level,
  ]);

  useEffect(() => {
    const dbLastCelebratedStreak = studentProfile?.last_celebrated_streak;
    const localLastCelebratedStreak = parseInt(
      localStorage.getItem("lastCelebratedStreak") || "0",
    );

    const lastCelebratedStreak =
      dbLastCelebratedStreak !== undefined
        ? dbLastCelebratedStreak
        : localLastCelebratedStreak;

    console.log(
      `🏆 Streak Milestone Check - consecutiveDays: ${consecutiveDays}, dbLastCelebratedStreak: ${dbLastCelebratedStreak}, lastCelebratedStreak: ${lastCelebratedStreak}`,
    );

    if (consecutiveDays === 7 && consecutiveDays > lastCelebratedStreak) {
      console.log(
        `🏆 Streak Milestone! Day 7 reached - Triggering Celebration!`,
      );

      localStorage.setItem("lastCelebratedStreak", consecutiveDays);

      UserAPI.postCelebrateStreak(consecutiveDays).catch((err) =>
        console.error("Failed to mark streak celebration in DB:", err),
      );

      const streakContainer = document.querySelector(".daily-streak-reward");
      const trophyElement = document.querySelector(
        '[alt*="trophy"], [alt*="Trophy"]',
      );
      const circleElements = document.querySelectorAll(
        ".streak-circle, .day-circle",
      );

      const confettiOrigin = streakContainer || document.body;

      ConfettiManager.celebrateStreakMilestone(confettiOrigin);

      if (streakContainer || trophyElement) {
        AnimationController.celebrateStreakMilestone(
          circleElements.length > 0 ? Array.from(circleElements) : null,
          trophyElement,
        );
      }

      setShowStreakCelebration(true);
    }
  }, [consecutiveDays, studentProfile?.last_celebrated_streak]);

  const lang = Helpers.getCurrentLanguage();

  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: "#fff",
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor:
        getTimeOfDay() === "morning"
          ? "#00CDD2"
          : getTimeOfDay() === "afternoon"
            ? "#FF5000"
            : "#8264FF",
    },
  }));

  const BorderLinearXp = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: "#E6E6E6",
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: "#00CDD2",
      transition: "transform 1.5s cubic-bezier(0.4, 0, 0.2, 1) !important",
      position: "relative",
      overflow: "hidden",
    },
  }));

  const styleModal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    bgcolor: "#fff",
    borderRadius: "20px",
    outline: "none",
  };

  return (
    <Stack>
      <DashboardModals
        loader={loader}
        isInitializing={isInitializing}
        showCongratulations={showCongratulations}
        setShowCongratulations={setShowCongratulations}
        showStreakCelebration={showStreakCelebration}
        setShowStreakCelebration={setShowStreakCelebration}
        showLevelUpCelebration={showLevelUpCelebration}
        setShowLevelUpCelebration={setShowLevelUpCelebration}
        showStreakPopup={showStreakPopup}
        setShowStreakPopup={setShowStreakPopup}
        consecutiveDays={consecutiveDays}
        setRunTour={setRunTour}
        modal={modal}
        setModal={setModal}
        styleModal={styleModal}
        head={head}
        mainClassName={mainClassName}
        attemptSubscribe={attemptSubscribe}
        avatarModal={avatarModal}
        setAvatarModal={setAvatarModal}
        ava={ava}
        displayLevel={displayLevel}
        updateAva={updateAva}
        showAvatarUnlock={showAvatarUnlock}
        setShowAvatarUnlock={setShowAvatarUnlock}
        unlockedAvatarLevel={unlockedAvatarLevel}
        showAppReportDrawer={showAppReportDrawer}
        setShowAppReportDrawer={setShowAppReportDrawer}
      />

      {}
      {}

      {(studentProfile?.paying ?? seededPaying) !== false && (
        <Stack className={mainClassName + "-student-wrapper"}>
          {}

          <Stack className={mainClassName + "-flex-container"}>
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @keyframes shimmer {
                    0% {
                      left: -100%;
                    }
                    100% {
                      left: 100%;
                    }
                  }
                  .dashboard-avatar-shine:hover::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 200px;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
                    animation: shimmer 2s ease-in-out infinite;
                    z-index: 2;
                    pointer-events: none;
                    border-radius: 1rem;
                  }
                `,
              }}
            />
            {studentProfile ? (
              <>
                <DashboardProfileCard
                  loader={loader}
                  mainClassName={mainClassName}
                  ava={ava}
                  setAvatarModal={setAvatarModal}
                  dataUser={dataUser}
                  studentProfile={studentProfile}
                  head={head}
                  displayLevel={displayLevel}
                  levelElementRef={levelElementRef}
                  starElementRef={starElementRef}
                  xpNumberRef={xpNumberRef}
                  xpNumberValue={xpNumberValue}
                  xpProgressValue={xpProgressValue}
                  progressFillRef={progressFillRef}
                  showShimmer={showShimmer}
                  statsContainerRef={statsContainerRef}
                  handleStatHover={handleStatHover}
                  handleStatLeave={handleStatLeave}
                  statsIconRefs={statsIconRefs}
                  statsCounterRefs={statsCounterRefs}
                  dataSummary={dataSummary}
                />
                <DashboardActivityCards
                  mainClassName={mainClassName}
                  getTimeOfDay={getTimeOfDay}
                  handleReportIconHover={handleReportIconHover}
                  reportIconRef={reportIconRef}
                  handleButtonClick={handleButtonClick}
                  router={router}
                  head={head}
                  handleQuestionIconHover={handleQuestionIconHover}
                  questionIconRef={questionIconRef}
                  buttonRefs={buttonRefs}
                />
              </>
            ) : null}
          </Stack>

          <Stack
            className={mainClassName + "-flex-container"}
            sx={{ alignItems: "flex-start", mt: { xs: 2, md: 8 } }}
          >
            <Stack className={mainClassName + "-flex-item-left2"}>
              <DashboardTodoSection
                mainClassName={mainClassName}
                head={head}
                todoContainerRef={todoContainerRef}
                todoClick={todoClick}
                todoRowRefs={todoRowRefs}
                isTodoChecked={isTodoChecked}
                quizList={quizList}
              />
              <Stack
                ref={streakCardRef}
                width="100%"
                alignItems="center"
                justifyContent="center"
                className="dashboard-page-streak-card-wrapper"
                sx={{
                  flex: "50%",
                  height: "320px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <StreakCard consecutiveDays={consecutiveDays} />
              </Stack>
            </Stack>
            <Stack
              className={mainClassName + "-flex-item-right2"}
              sx={{
                height: "320px",
                display: "flex",
                alignItems: "flex-start",
                marginLeft: "10px",
              }}
            >
              <TimerModule size={200} strokeWidth={10} maxMinutes={20} />
            </Stack>
          </Stack>
        </Stack>
      )}

      <DashboardOnboardingTour
        loader={loader}
        isInitializing={isInitializing}
        runTour={runTour}
        setRunTour={setRunTour}
        showStreakPopup={showStreakPopup}
      />
    </Stack>
  );
}

const CalendarCustom = (props) => {
  const { date, events, router, dataUser } = props;
  const mainClassName = "dashboard-page";

  const isDateExist = () => {
    return events?.some(
      (val) => val?.start === dayjs(date)?.format("YYYY-MM-DD"),
    );
  };

  const handleClick = () => {
    if (isDateExist()) {
      const data = events?.find(
        (val) => val?.start === dayjs(date)?.format("YYYY-MM-DD"),
      );
      router.push(
        `/reports/daily/detail?date=${dayjs(data?.start).format("YYYY-MM-DD")}&subject=${data?.title}&year=${dataUser?.year}`,
      );
    }
  };

  return (
    <div
      onClick={handleClick}
      className={
        mainClassName + `-calendar-container${!isDateExist() ? "-regular" : ""}`
      }
    >
      <Typography className={mainClassName + "-calendar-text"}>
        {dayjs(date)?.format("DD")}
      </Typography>
    </div>
  );
};
