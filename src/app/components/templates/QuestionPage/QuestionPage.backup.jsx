import { Component } from "react";
import { getDataHead } from "@/app/data/head";
import {
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Collapse,
  Divider,
  Button as ButtonMUI,
  Box,
} from "@mui/material";
import { getLabel, locale } from "@/app/data/locale";

import {
  Chip,
  Skeleton,
  Tabs,
  IconCustom,
  Button,
  ImageHandler,
  List,
  Dropdown,
  DropdownInput,
  IconButton,
  Loader,
  ExerciseLoader,
  IconPopover,
  LoaderGraph,
  ScrollingText,
} from "@/components/elements";

import {
  ModalConfirm,
  FormGenerator,
  NoticeCard,
  ModalDrawer,
} from "@/components/modules";

import ContentLayout from "@/components/layouts/ContentLayout/ContentLayout";

import dayjs from "dayjs";
import _ from "lodash";
import { CategoryHelpers, Helpers } from "@/src/app/utils";
import { headCategories } from "@/src/app/data/head/global";
import Image from "next/image";
import { Config } from "@/src/app/constant";

const RichText = dynamic(
  () =>
    import("../../sections/richText").then((m) => ({ default: m.RichText })),
  { ssr: false }
);
import { Auth } from "@/src/app/data/local";
import dynamic from "next/dynamic";
import QuestionsAPI from "@/app/data/api/QuestionsAPI";
import gsap from "gsap";

import { connect } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import nProgress from "nprogress";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import { QuestionTimer } from ".";
import UserAPI from "@/src/app/data/api/UserAPI";
import { Tooltip } from "@/elements";
import ExerciseAnimationController from "@/app/utils/ExerciseAnimationController";
import ttsManager from "@/app/utils/TextToSpeechManager";
import React from "react";
import loadingAnimation from "@/assets/animations/Loading_Screen_Bobby_Surfing.json";
import sikaoAnimation from "@/assets/animations/xuexi.json";

// Lazy-load heavy components (drawer, modal, Lottie) to reduce initial bundle
const IssueReportDrawer = dynamic(
  () =>
    import("@/elements").then((m) => ({ default: m.IssueReportDrawer })),
  { ssr: false }
);

const RichTextTextModalComponent = dynamic(
  () =>
    import("@/app/components/sections/richText/extensions/modal").then((m) => ({
      default: m.RichTextTextModalComponent,
    })),
  { ssr: false }
);

const Lottie = dynamic(
  () => import("lottie-react"),
  { ssr: false }
);
import ProgressBar from "./ProgressBar";
import { fieryHoverSx } from "@/components/elements/styles/fieryHover";

// Import sound files
const sound0Result = "/sounds/0_Result_exercise_result.mp3";
const sound20_40Result = "/sounds/20_40_Result_exercise_result.mp3";
const sound60_80Result = "/sounds/60_80_Result_exercise_result.mp3";
const sound100Result = "/sounds/100_Result_exercise_result.mp3";
const soundNextExercise =
  "/sounds/Clicked_Next_Exercise_exercise_result_page.mp3";
const soundAskPotter = "/sounds/Clicked_Ask_Potter_Exercise_Result.mp3";
const soundIncorrectAnswer =
  "/sounds/On_Incorrect_Answer_Exercise_Result_turn_up_its_volume.mp3";
const soundAlert = "/sounds/Alert_exercise_page_turn_up_its_volume.mp3";
let intervalQuiz = null;

class QuestionPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-question-page",
      activeScreen: "category",
      modalCategories: {
        isOpen: 0,
      },
      showLoader: false,
      showExerciseLoader: false,
      loadingButtonSaveCategory: false,
      loadingButtonStartExercise: true,
      scoreResult: null,
      openScoreResult: false,
      modalDrawer: {
        isOpen: 0,
      },
      timeSpent: 0,
      timeStart: 0,
      timeEnd: 0,
      startTimer: false,
      selectedCategories: [],
      isSpeaking: false,
      openPotterModal: false,
      potterHistoryChat: null,
      potterClickPosition: null,
      loadingPotterInit: false,
    };
    this.refRichText = {};

    // Refs for animations
    this.categoryCardsRefs = [];
    this.startButtonRef = React.createRef();
    this.questionTabsRefs = [];
    this.questionContainerRef = React.createRef();
    this.nextButtonRef = React.createRef();
    this.submitButtonRef = React.createRef();
    this.mascotRef = React.createRef();
    this.scoreRef = React.createRef();
    this.percentageRef = React.createRef();
    this.timeStatsRef = React.createRef();
    this.accuracyStatsRef = React.createRef();
    this.starsStatsRef = React.createRef();

    // Scroll navigation properties
    this.scrollDelta = 0;
    this.scrollTimeout = null;
    this.isScrolling = false;
    this.SCROLL_THRESHOLD = 200; // pixels needed to trigger navigation

    // Audio refs for result sounds
    this.audioRef0Result = null;
    this.audioRef20_40Result = null;
    this.audioRef60_80Result = null;
    this.audioRef100Result = null;

    // Audio refs for Phase 2A sounds
    this.audioRefNextExercise = null;
    this.audioRefAskPotter = null;
    this.audioRefIncorrectAnswer = null;
    this.audioRefAlert = null;
  }

  componentDidUpdate(prevProps, prevState) {
    // start/stop a 1s ticker to refresh progress bar
    if (prevState.startTimer && !this.state.startTimer) {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }

    // Play result sound when scoreResult is set
    if (!prevState.scoreResult && this.state.scoreResult) {
      // Check if sound is enabled (default to enabled if not set)
      const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
      if (soundEnabled) {
        const percentage = this.state.scoreResult?.percentage || 0;
        const { ref, path } = this.getResultAudioRef(percentage);

        // Get or create audio ref (simplified like coin-balance)
        let audioRef = ref;
        if (!audioRef) {
          audioRef = new Audio(path);
          // Store the ref back to the appropriate property
          if (percentage === 0) {
            this.audioRef0Result = audioRef;
          } else if (percentage >= 90) {
            this.audioRef100Result = audioRef;
          } else if (percentage >= 50) {
            this.audioRef60_80Result = audioRef;
          } else {
            this.audioRef20_40Result = audioRef;
          }
        }

        // Play sound directly (like coin-balance pattern)
        audioRef.currentTime = 0;
        audioRef.play().catch((err) => {
          console.error("Error playing result sound:", err, "Path:", path);
        });
      }
    }

    // Play incorrect answer sound when user visits an incorrect answer tab
    if (
      this.state.scoreResult &&
      prevState.activeTab !== this.state.activeTab &&
      this.state.activeTab !== 1
    ) {
      // Check if current tab has an incorrect answer
      const questionResult = this.state.scoreResult?.dataQuestion?.find(
        (q) => q.id === this.state.activeTab,
      );
      const isIncorrect =
        questionResult?.accuracy === false || questionResult?.accuracy === 0;

      if (isIncorrect) {
        // Play incorrect answer sound when visiting incorrect answer tab
        this.playIncorrectAnswerSound();
      }
    }
  }

  componentWillUnmount() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // Map accuracy percentage to GIF file path
  getAccuracyGif(percentage) {
    const accuracy = percentage || 0;
    if (accuracy === 0) {
      return "/images/animation/0__number.gif";
    } else if (accuracy >= 90) {
      return "/images/animation/100.gif";
    } else if (accuracy >= 70) {
      return "/images/animation/80.gif";
    } else if (accuracy >= 50) {
      return "/images/animation/60.gif";
    } else if (accuracy >= 30) {
      return "/images/animation/40.gif";
    } else {
      return "/images/animation/20.gif";
    }
  }

  // Map accuracy percentage to character name (Bobby or Potter)
  getCharacterName(percentage) {
    const accuracy = percentage || 0;
    if (accuracy >= 90) {
      return "Bobby"; // 100.gif
    } else if (accuracy >= 70) {
      return "Potter"; // 80.gif
    } else if (accuracy >= 50) {
      return "Bobby"; // 60.gif
    } else if (accuracy >= 30) {
      return "Potter"; // 40.gif
    } else {
      return "Bobby"; // 20.gif
    }
  }

  // Round percentage to nearest value: 0, 20, 40, 60, 80, 100
  roundScore(percentage) {
    const score = percentage || 0;
    const roundedValues = [0, 20, 40, 60, 80, 100];
    let nearest = roundedValues[0];
    let minDiff = Math.abs(score - nearest);

    for (let i = 1; i < roundedValues.length; i++) {
      const diff = Math.abs(score - roundedValues[i]);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = roundedValues[i];
      }
    }

    return nearest;
  }

  // Map accuracy percentage to result sound audio ref
  getResultAudioRef(percentage) {
    const accuracy = percentage || 0;
    if (accuracy === 0) {
      return { ref: this.audioRef0Result, path: sound0Result };
    } else if (accuracy >= 90) {
      return { ref: this.audioRef100Result, path: sound100Result };
    } else if (accuracy >= 50) {
      return { ref: this.audioRef60_80Result, path: sound60_80Result };
    } else {
      return { ref: this.audioRef20_40Result, path: sound20_40Result };
    }
  }

  // Play result sound based on percentage
  playResultSound(percentage) {
    // Check if sound is enabled (default to enabled if not set)
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;

    const { ref, path } = this.getResultAudioRef(percentage || 0);

    // Get or create audio ref (like coin-balance pattern)
    let audioRef = ref;
    if (!audioRef) {
      audioRef = new Audio(path);
      // Store the ref back to the appropriate property
      const accuracy = percentage || 0;
      if (accuracy === 0) {
        this.audioRef0Result = audioRef;
      } else if (accuracy >= 90) {
        this.audioRef100Result = audioRef;
      } else if (accuracy >= 50) {
        this.audioRef60_80Result = audioRef;
      } else {
        this.audioRef20_40Result = audioRef;
      }
    }

    // Play sound directly (like coin-balance pattern)
    audioRef.currentTime = 0;
    audioRef.play().catch((err) => {
      console.error("Error playing result sound:", err, "Path:", path);
    });
  }

  // Play next exercise sound (Continue button on result page)
  playNextExerciseSound() {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;

    if (!this.audioRefNextExercise) {
      this.audioRefNextExercise = new Audio(soundNextExercise);
    }

    this.audioRefNextExercise.currentTime = 0;
    this.audioRefNextExercise.play().catch((err) => {
      console.error("Error playing next exercise sound:", err);
    });
  }

  // Play ask Potter sound
  playAskPotterSound() {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;

    if (!this.audioRefAskPotter) {
      this.audioRefAskPotter = new Audio(soundAskPotter);
    }

    this.audioRefAskPotter.currentTime = 0;
    this.audioRefAskPotter.play().catch((err) => {
      console.error("Error playing ask Potter sound:", err);
    });
  }

  // Play incorrect answer sound
  playIncorrectAnswerSound() {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;

    if (!this.audioRefIncorrectAnswer) {
      this.audioRefIncorrectAnswer = new Audio(soundIncorrectAnswer);
    }

    this.audioRefIncorrectAnswer.currentTime = 0;
    this.audioRefIncorrectAnswer.play().catch((err) => {
      console.error("Error playing incorrect answer sound:", err);
    });
  }

  // Play alert sound
  playAlertSound() {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;

    if (!this.audioRefAlert) {
      this.audioRefAlert = new Audio(soundAlert);
    }

    this.audioRefAlert.currentTime = 0;
    this.audioRefAlert.play().catch((err) => {
      console.error("Error playing alert sound:", err);
    });
  }

  // Map numeric difficulty 1-5 to human readable labels
  getDifficultyLabel(value) {
    const numeric = Number(value);
    const mapping = {
      1: "easy",
      2: "normal",
      3: "hard",
      4: "challenging",
      5: "very challenging",
    };
    return mapping[numeric] || value;
  }

  // Get category label like "1.1 Positions" from dataCategory prop (same format as category selection page)
  getCategoryLabel(outerCategory) {
    try {
      // First, try to find the category in dataCategory prop (same source as category selection page)
      const { dataCategory } = this.props;
      if (dataCategory && Array.isArray(dataCategory)) {
        const foundCategory = dataCategory.find(
          (cat) => cat?.id == outerCategory || cat?.id === outerCategory,
        );
        if (foundCategory?.label) {
          return foundCategory.label;
        }
      }

      // Fallback: use headCategories if dataCategory not available
      const year = Config.userYear || 1;
      const yearData = headCategories?.[year] || {};

      // Construct the key like "2.1" from year and outer_category number
      const constructedKey = `${year}.${outerCategory}`;

      // Try to find the category in any section
      for (const sectionId of Object.keys(yearData)) {
        const section = yearData[sectionId];
        if (!section) continue;

        // First try the constructed key (e.g., "2.1")
        if (Object.prototype.hasOwnProperty.call(section, constructedKey)) {
          const val = section[constructedKey];
          if (val && typeof val === "object" && (val.en || val.zh)) {
            const text = val.en || val.zh || "";
            return `${constructedKey} ${text}`.trim();
          }
          if (typeof val === "string") {
            return `${constructedKey} ${val}`.trim();
          }
        }

        // Also try the outerCategory as direct key (fallback)
        const outerKey = String(outerCategory);
        if (Object.prototype.hasOwnProperty.call(section, outerKey)) {
          const val = section[outerKey];
          if (val && typeof val === "object" && (val.en || val.zh)) {
            const text = val.en || val.zh || "";
            return `${outerKey} ${text}`.trim();
          }
          if (typeof val === "string") {
            return `${outerKey} ${val}`.trim();
          }
        }
      }

      // If not found, return the constructed key or original value
      return constructedKey;
    } catch (e) {
      return String(outerCategory);
    }
  }

  formatTime(totalSeconds) {
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0",
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  formatStartEndTime(time) {
    if (time > 0) {
      const hours = String(time?.getHours()).padStart(2, "0");
      const minutes = String(time?.getMinutes()).padStart(2, "0");
      return {
        hours: hours?.split(""),
        minutes: minutes?.split(""),
      };
    }

    return {
      hours: "??",
      minutes: "??",
    };
  }

  openLoader(showLoader) {
    this.setState({
      showLoader: showLoader,
    });
  }

  openPotterModalAction = async (event) => {
    // Play ask Potter sound
    this.playAskPotterSound();

    // Capture click coordinates
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = rect.left + rect.width / 2; // Center of animation
      const clickY = rect.top + rect.height / 2; // Center of animation
      this.setState({ potterClickPosition: { x: clickX, y: clickY } });
    }

    const qid = localStorage.getItem("activeTab");
    if (this.state.potterHistoryChat === null && qid) {
      this.setState({ loadingPotterInit: true });
      try {
        const res = await QuestionsAPI.chatGetHistory({ question_id: qid }, {});
        const data = res?.payload?.data?.chatHistory;
        let chatData_ = [];
        for (let i = 0; i < data?.length; i += 1) {
          chatData_.push({
            type: data[i]?.role === "user" ? "right" : "left",
            date: data[i]?.created_at,
            msg: data[i]?.message,
          });
        }
        this.setState({
          potterHistoryChat: chatData_,
          loadingPotterInit: false,
          openPotterModal: true,
        });
      } catch (error) {
        this.setState({ loadingPotterInit: false });
      }
    } else {
      this.setState({ openPotterModal: true });
    }
  };

  handleScrollNavigation = (event) => {
    // Prevent if already navigating or animating
    if (this.isScrolling) {
      return;
    }

    // Accumulate scroll delta
    this.scrollDelta += Math.abs(event.deltaY);

    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Check if threshold exceeded
    if (this.scrollDelta >= this.SCROLL_THRESHOLD) {
      const scrollDirection = event.deltaY > 0 ? "down" : "up";

      // Reset delta and set flag
      this.scrollDelta = 0;
      this.isScrolling = true;

      // Lock body scroll during navigation
      document.body.classList.add("question-navigation-active");

      // Navigate based on direction
      if (scrollDirection === "down") {
        this.handleEvent({ type: "next-question" }).finally(() => {
          // Reset flag after navigation completes
          setTimeout(() => {
            this.isScrolling = false;
            document.body.classList.remove("question-navigation-active");
          }, 500);
        });
      } else {
        this.handleEvent({ type: "previous-question" }).finally(() => {
          setTimeout(() => {
            this.isScrolling = false;
            document.body.classList.remove("question-navigation-active");
          }, 500);
        });
      }
    } else {
      // Reset delta if no scroll for 300ms
      this.scrollTimeout = setTimeout(() => {
        this.scrollDelta = 0;
      }, 300);
    }
  };

  async assignDataAnswer(newActiveTab, newValue, shouldValidate = false) {
    // if null check all validation

    try {
      const {
        state: { dataAnswer },
        props: {},
      } = this;

      // ==========================================================================
      // ================================= INTIALIZE FLAG =========================
      // ==========================================================================

      const activeTab = newActiveTab || this.state.activeTab;

      let foundIndex = dataAnswer.findIndex((item) => item.id == activeTab);

      let value =
        newValue ||
        (_.has(this.refRichText, activeTab)
          ? this.refRichText[activeTab]
          : dataAnswer[foundIndex]?.question);

      // If value still doesn't exist, try to read from DOM
      if (!value && this.state.activeScreen === "question") {
        const questionWrapper = document.querySelector(
          `.${this.state.mainClassName}-wrapper.active`,
        );

        if (questionWrapper) {
          // Try to build value from DOM elements
          const richTextEditor = questionWrapper.querySelector(".ProseMirror");
          if (richTextEditor) {
            // Try to get the JSON structure from the editor
            try {
              // Access the editor instance if available
              const editor = richTextEditor.__prosemirrorView;
              if (editor && editor.state) {
                value = editor.state.doc.toJSON();
              }
            } catch (e) {
              console.log("Could not read from editor instance");
            }
          }

          // If still no value, try to read from rendered content
          if (!value && dataAnswer[foundIndex]?.question) {
            value = dataAnswer[foundIndex]?.question;
          }
        }
      }

      if (value) {
        let isInvalid = false;

        const arrAnswer = Helpers.getAttributeRichText(value);

        let refactorDataAnswer = [...(dataAnswer || [])];

        // ==========================================================================
        // ============================= REFACTOR DATA ANSWER =======================
        // ==========================================================================

        const sliceUnit = (unit, label) => {
          if (unit) {
            return label.replace(" " + unit, "");
          }
          return label;
        };

        if (foundIndex >= 0) {
          let emptyFieldInfo = null; // Track empty field info
          const refactorArrAnswer = arrAnswer?.map((item, index) => {
            let refactorItem = {};
            const val = item?.attrs?.value;
            const unit = item?.attrs?.unit;

            if (val) {
              switch (item?.type) {
                case "DropdownReactComponent":
                  {
                    const isArray = Array.isArray(val);

                    refactorItem = {
                      answers: isArray
                        ? val?.flatMap((item) => sliceUnit(unit, item.label))
                        : [sliceUnit(unit, val?.label)],
                      attrs: item?.attrs,
                    };
                  }
                  break;

                case "TextFieldReactComponent":
                  {
                    refactorItem = {
                      answers: [val],
                      attrs: item?.attrs,
                    };
                  }
                  break;

                case "FractionReactComponent":
                  {
                    refactorItem = {
                      answers: [val],
                      attrs: item?.attrs,
                    };
                  }
                  break;
              }
            } else {
              isInvalid = true;
              // Track empty field info for better targeting
              emptyFieldInfo = {
                index: index,
                type: item?.type,
                attrs: item?.attrs,
              };
              return null;
            }

            return refactorItem;
          });

          // Filter out null values (incomplete answers)
          const validAnswers = refactorArrAnswer?.filter(
            (item) => item !== null,
          );
          const totalFields = arrAnswer?.length || 0;

          if (
            validAnswers?.length > 0 &&
            validAnswers?.length === totalFields
          ) {
            // All required fields filled
            refactorDataAnswer[foundIndex]["answer"] = validAnswers;
            isInvalid = false;
          } else {
            // Some fields empty
            isInvalid = true;
          }

          refactorDataAnswer[foundIndex]["isInvalid"] = isInvalid;

          // Only show validation feedback when explicitly requested (e.g., clicking "Next Question")
          if (isInvalid && shouldValidate) {
            // Play alert sound
            this.playAlertSound();

            Helpers.openSnackbar({
              name: "incompleteForm",
            });

            // 3.11 - Incomplete answer shake animation - target specific empty field
            setTimeout(() => {
              let targetField = null;

              // Method 1: Try to find empty fields by checking their actual values
              const allFields = document.querySelectorAll(
                `.template-question-page-question .active .rich-text-text-field-component, 
                 .template-question-page-question .active .rich-text-dropdown-component,
                 .template-question-page-question .active .rich-text-fraction-component`,
              );

              // Check each field to see if it's actually empty
              for (let i = 0; i < allFields.length; i++) {
                const field = allFields[i];
                let isEmpty = false;

                // Check if field is empty based on its type
                if (
                  field.classList.contains("rich-text-text-field-component")
                ) {
                  const input = field.querySelector("input");
                  isEmpty = !input || !input.value || input.value.trim() === "";
                } else if (
                  field.classList.contains("rich-text-dropdown-component")
                ) {
                  const select = field.querySelector("select");
                  isEmpty = !select || !select.value || select.value === "";
                } else if (
                  field.classList.contains("rich-text-fraction-component")
                ) {
                  const inputs = field.querySelectorAll("input");
                  isEmpty =
                    !inputs ||
                    inputs.length === 0 ||
                    Array.from(inputs).every(
                      (input) => !input.value || input.value.trim() === "",
                    );
                }

                if (isEmpty) {
                  targetField = field;
                  console.log(
                    `⚠️ Found empty field at DOM index ${i}, type: ${field.className}`,
                  );
                  break;
                }
              }

              // Fallback to first field if no empty field found
              if (!targetField && allFields.length > 0) {
                targetField = allFields[0];
                console.log("⚠️ Fallback to first field");
              }

              if (targetField) {
                console.log("⚠️ Triggering incomplete answer shake animation");
                ExerciseAnimationController.animateIncompleteAnswer(
                  targetField,
                );
              }
            }, 100);
          }
        } else {
          isInvalid = true;
        }

        // ==========================================================================
        // ================================= Save State =============================
        // ==========================================================================

        this.setState({
          dataAnswer: refactorDataAnswer,
          isInvalid,
        });

        return {
          dataAnswer: refactorDataAnswer,
          isInvalid,
        };
      }

      return null;
    } catch (err) {
      // Error handling
    }
  }

  setLoadingExerciseBtn(bool) {
    this.setState({
      loadingButtonStartExercise: bool,
    });
  }

  // TTS Methods
  handleTTSToggle = () => {
    if (!ttsManager.isSupported()) {
      return;
    }

    if (this.state.isSpeaking) {
      ttsManager.stop();
      this.setState({ isSpeaking: false });
    } else {
      // Find the currently active question element
      const activeQuestionElement = document.querySelector(
        `.section-rich-text-editor[data-question-id="${this.state.activeTab}"]`,
      );

      // Fallback: find the visible question element
      const questionElement =
        activeQuestionElement ||
        document.querySelector(
          '.section-rich-text-editor:not([style*="display: none"])',
        ) ||
        document.querySelector(".section-rich-text-editor");

      if (questionElement) {
        const text =
          questionElement.textContent || questionElement.innerText || "";
        const cleanText = text.trim();

        if (cleanText) {
          // Set up callback before speaking
          ttsManager.onStateChange = (state) => {
            this.setState({ isSpeaking: state.speaking });
          };

          // Speak the text
          ttsManager.speak(cleanText);
        }
      }
    }
  };

  async handleEvent(params) {
    try {
      const {
        state: {
          activeTab,
          selectedCategories,
          dataQuestions,
          dataQuestionsTab,
        },
        props: { head },
      } = this;

      switch (params?.type) {
        case "open-score-result":
          {
            this.setState({
              openScoreResult: true,
            });
          }
          break;

        case "close-score-result":
          {
            this.setState({
              openScoreResult: false,
            });
          }
          break;

        case "submit":
          {
            // 3.8 - Submit button animation
            if (this.submitButtonRef.current) {
              ExerciseAnimationController.animateSubmitButton(
                this.submitButtonRef.current,
                () => {
                  console.log("✅ Submit animation complete");
                },
              );
            }

            this.setState({ timeEnd: new Date(), startTimer: false });

            // Wait for validation before proceeding
            setTimeout(async () => {
              document?.querySelector(".content-layout-main")?.scrollIntoView();

              const dataTime = this.getTimeDuration(
                this.state.dataTime,
                activeTab,
              );

              const { isInvalid, dataAnswer } = await this.assignDataAnswer(
                activeTab,
                null,
                true,
              );

              if (!isInvalid && this.props.postCompleteQuestion) {
                // Call API first, then trigger coin animation after it completes
                const result = await this.props.postCompleteQuestion({
                  dataAnswer,
                  dataTime,
                });

                // Extract the actual response from the payload wrapper
                const apiResponse = result?.payload || result;

                // Simple recursive helper for answer injection
                const injectReviewData = (
                  content,
                  answers,
                  explanation,
                  accuracy,
                ) => {
                  if (!content) return content;
                  try {
                    const isStr = typeof content === "string";
                    const json = isStr ? JSON.parse(content) : content;
                    if (!json?.content) return content;

                    let idx = 0;
                    const walk = (nodes) =>
                      (nodes || []).map((n) => {
                        if (!n) return n;
                        let updated = { ...n };
                        if (
                          ["dropdown", "textfield", "fractionField"].includes(
                            n.type,
                          )
                        ) {
                          const ansArr = Array.isArray(answers) ? answers : [];
                          const ans = ansArr[idx++];

                          // Priority 1: Keep what's already in the content (from parent's refactor)
                          // Priority 2: Take from answer attributes
                          // Priority 3: Take from first element of answers array (for simple text fields)
                          const userValue =
                            n.attrs?.value ||
                            ans?.attrs?.value ||
                            (n.type === "textfield" ? ans?.answers?.[0] : null);

                          updated.attrs = {
                            ...(n.attrs || {}),
                            value: userValue,
                            answers: ans?.answers
                              ? JSON.stringify(
                                  ans.answers.map((a) => ({ label: a, id: a })),
                                )
                              : n.attrs?.answers,
                            explanation: explanation || n.attrs?.explanation,
                            isCorrect:
                              ans?.isCorrect ??
                              (accuracy === true || accuracy === 1),
                          };
                        }
                        if (n.content) updated.content = walk(n.content);
                        return updated;
                      });

                    const result = { ...json, content: walk(json.content) };
                    return isStr ? JSON.stringify(result) : result;
                  } catch (e) {
                    return content;
                  }
                };

                const questionsRaw =
                  apiResponse?.dataQuestion || apiResponse?.data || [];
                const questionsEnriched = Array.isArray(questionsRaw)
                  ? questionsRaw.map((q) => {
                      const content = q.question || q.question_object;
                      return {
                        ...q,
                        question: injectReviewData(
                          content,
                          q.answer || q.answers,
                          q.explanation,
                          q.accuracy,
                        ),
                        elementKey:
                          q.elementKey || `review-key-${q.id || Math.random()}`,
                      };
                    })
                  : [];

                // The API returns `data` which contains the questions array
                // The render expects `dataQuestion` - so we need to map it
                const scoreResult = {
                  ...apiResponse,
                  dataQuestion:
                    questionsEnriched.length > 0
                      ? questionsEnriched
                      : questionsRaw,
                  percentage:
                    apiResponse?.percentage ||
                    Math.round(
                      ((dataAnswer?.filter((a) => a?.isCorrect)?.length || 0) /
                        (dataAnswer?.length || 1)) *
                        100,
                    ),
                };

                // Trigger coin animation AFTER successful API call
                if (window.triggerCoinIncrement) {
                  const coinsAwarded = apiResponse?.coins_awarded || 0;
                  if (coinsAwarded > 0) {
                    window.triggerCoinIncrement(coinsAwarded);
                  }
                }

                // Persistent Todo: Mark Daily Exercise ("exercise") as complete
                const todayStr = new Date().toISOString().split("T")[0];
                UserAPI.postUpdateTodos(["exercise"], todayStr).catch((e) =>
                  console.error("Failed to sync exercise todo:", e),
                );

                const refactorModalDrawer = {
                  ...(head?.modalDrawer || {}),
                  isOpen: _.uniqueId(),
                  title: locale(head?.modalDrawer?.title, {
                    value: dataAnswer?.length,
                  }),
                };

                const refactorQuestionTab = this.updateTabQuestion(
                  dataQuestionsTab,
                  scoreResult?.dataQuestion,
                );

                let newDataQuest = dataQuestions;
                let newDataQuestTab = refactorQuestionTab;

                newDataQuest?.push({
                  id: 1,
                  difficulty: 1,
                  outer_category: 1,
                  question: null,
                });

                newDataQuestTab?.push({
                  id: 1,
                  label: locale(head?.result),
                  className: "",
                  icon: "result",
                  iconPosition: "start",
                  iconSize: "sm",
                });

                this.setState({
                  showResult: true,
                  scoreResult: scoreResult,
                  openScoreResult: true,
                  modalDrawer: refactorModalDrawer,
                  dataQuestionsTab: newDataQuestTab,
                  dataQuestions: newDataQuest,
                  activeTab: 1,
                });

                // Play result sound directly (within user action context)
                this.playResultSound(scoreResult?.percentage);

                const dataUser = await Auth.refreshCurrentUser();

                await this.props.assignMainLayout({
                  type: "ASSIGN_UPDATE_USER_INFO",
                  value: dataUser,
                });
              }
            }, 100); // Small delay for validation
          }
          break;

        case "back":
          {
            this.props.clearQuestion();
            this.refRichText = {};
            this.setState({
              activeScreen: "category",
              scoreResult: null,
              dataAnswer: null,
              activeTab: null,

              showIssueDrawer: false,
              targetIssueQuestionId: null,
              modalDrawer: {
                isOpen: 0,
              },
              dataQuestions: null,
              dataQuestionsTab: null,
            });
            nProgress.done();
          }
          break;

        case "show-excercise":
          {
            if (this.state.dataQuestions?.length > 0) {
              this.setState({
                activeScreen: "question",
                timeStart: new Date(),
                startTimer: true,
              });
            }
          }
          break;

        case "try-again":
          {
            // Play next exercise sound
            this.playNextExerciseSound();

            // Don't clear state - keep previous content visible
            // Just show loading screen on top
            this.refRichText = {};

            // Show loading screen overlay
            this.setState({
              showExerciseLoader: true,
            });

            // Fetch new questions while previous content is still visible
            const response = await this.props.setCategory(selectedCategories);
            const newDataPromise = this.props.getQuestion();

            // Immediately process data without waiting 3000ms
            const startExerciseAgain = async () => {
              const newData = await newDataPromise;

              if (newData?.dataQuestions?.length > 0) {
                const activeTab = newData?.dataQuestionsTab[0]?.id;

                let dataTime = [];

                const dataAnswer = Helpers.structuredClone(
                  newData?.dataQuestions,
                )?.flatMap((item) => {
                  dataTime.push({
                    id: item?.id,
                    timeStart: item?.id == activeTab ? dayjs() : null,
                    timeEnd: null,
                  });
                  return {
                    ...(item || {}),
                    time_taken: item?.time_taken || 0,
                  };
                });

                localStorage.setItem("activeTab", activeTab);

                // Now clear previous content and transition to new quiz
                this.props.clearQuestion();
                this.setState({
                  scoreResult: null,
                  dataAnswer,
                  dataTime,
                  activeTab: activeTab,
                  dataQuestions: newData?.dataQuestions,
                  dataQuestionsTab: newData?.dataQuestionsTab,
                  activeScreen: "question",
                  timeStart: new Date(),
                  startTimer: true,
                  showExerciseLoader: false,
                  modalDrawer: {
                    isOpen: 0,
                  },
                });
              } else {
                Helpers.openSnackbar();
              }
            };
            startExerciseAgain();
          }
          break;

        case "change-category":
          {
            this.setState({
              selectedCategories: params?.value,
            });
          }
          break;

        case "save-category":
          {
            await this.setState({
              loadingButtonSaveCategory: true,
            });

            const response = await this.props.setCategory(selectedCategories);

            await this.setState({
              loadingButtonSaveCategory: false,
            });
          }
          break;

        case "start-excercise":
          {
            // 3.2 - Start button click animation
            if (this.startButtonRef.current) {
              ExerciseAnimationController.stopStartButtonPulse(
                this.startButtonRef.current,
              );
              ExerciseAnimationController.animateStartButtonClick(
                this.startButtonRef.current,
                () => {
                  const validRefs = this.categoryCardsRefs.filter(
                    (ref) => ref !== null,
                  );

                  this.setState({ showExerciseLoader: true });

                  if (validRefs.length > 0) {
                    // Just play animation; don't switch screen yet.
                    // Screen will switch directly to "question" once API data arrives.
                    ExerciseAnimationController.animateCategoriesFadeOut(
                      validRefs,
                    );
                  }
                },
              );
            }

            this.setLoadingExerciseBtn(true);

            if (selectedCategories?.length > 0) {
              const isLoaderDisplayedBefore = localStorage.getItem("loader");

              if (isLoaderDisplayedBefore) {
                nProgress.start();
              }

              const response = await this.props.setCategory(selectedCategories);

              const newDataPromise = this.props.getQuestion();

              // Immediately process data without waiting 3000ms
              const startExercise = async () => {
                const newData = await newDataPromise;

                if (newData?.dataQuestions?.length > 0) {
                  const activeTab = newData?.dataQuestionsTab[0]?.id;

                  let dataTime = [];

                  const dataAnswer = Helpers.structuredClone(
                    newData?.dataQuestions,
                  )?.flatMap((item) => {
                    dataTime.push({
                      id: item?.id,
                      timeStart: item?.id == activeTab ? dayjs() : null,
                      timeEnd: null,
                    });
                    return {
                      ...(item || {}),
                      time_taken: item?.time_taken || 0,
                    };
                  });

                  localStorage.setItem("activeTab", activeTab);

                  this.setState({
                    // activeScreen: 'question',
                    questionReady: true,
                    activeTab: activeTab,
                    dataAnswer,
                    dataTime,
                  });
                } else {
                  Helpers.openSnackbar();
                }

                let newDataQuest = newData?.dataQuestions;
                let newDataQuestTab = newData?.dataQuestionsTab;

                this.setState({
                  dataQuestions: newDataQuest,
                  dataQuestionsTab: newDataQuestTab,
                });

                if (isLoaderDisplayedBefore) {
                  nProgress.done();
                  setTimeout(() => {
                    this.setState({
                      activeScreen: "question",
                      timeStart: new Date(),
                      startTimer: true,
                    });
                    // Close ExerciseLoader modal when questions are ready
                    this.setState({ showExerciseLoader: false });
                  }, 100);
                } else {
                  // Close ExerciseLoader modal and show question screen when questions are ready
                  this.setState({ showExerciseLoader: false });
                  setTimeout(() => {
                    this.setState({
                      activeScreen: "question",
                      timeStart: new Date(),
                      startTimer: true,
                    });
                  }, 100);
                }
              };
              startExercise();

              // await this.openLoader(false)
            } else {
              Helpers.openSnackbar({
                message: "Please select category first",
              });
            }
          }
          break;

        case "switch-tab":
          {
            localStorage.setItem("activeTab", parseInt(params?.value));

            this.setState({
              activeTab: parseInt(params?.value),
            });

            if (params?.value == 1) {
              this.setState({
                activeTab: parseInt(params?.value),
              });
            } else {
              const { isInvalid } = await this.assignDataAnswer(
                activeTab,
                null,
                false,
              );

              if (!isInvalid) {
                this.setState({
                  activeTab: params?.value,
                });
              }
            }
          }
          break;

        case "previous-question":
          {
            // Navigate to previous question without validation
            const questionIndex = dataQuestionsTab?.findIndex(
              (item) => item.id == activeTab,
            );

            // Check if not on first question
            if (questionIndex > 0) {
              const prevQuestionIndex = questionIndex - 1;
              const prevQuestionId = dataQuestionsTab[prevQuestionIndex]?.id;

              localStorage.setItem("activeTab", prevQuestionId);
              this.setState({
                activeTab: prevQuestionId,
              });
            }
          }
          break;

        case "next-question":
          {
            // ==========================================================================
            // ================================= TAB HANDLER ============================
            // ==========================================================================

            // If already submitted (scoreResult exists), skip validation on navigation
            if (this.state.scoreResult) {
              const questionIndex = dataQuestionsTab?.findIndex(
                (item) => item.id == activeTab,
              );

              if (questionIndex < dataQuestionsTab?.length - 1) {
                const nextId = dataQuestionsTab[questionIndex + 1]?.id;
                localStorage.setItem("activeTab", nextId);
                this.setState({ activeTab: nextId });
              }
              break;
            }

            const { isInvalid } = await this.assignDataAnswer(
              activeTab,
              null,
              true,
            );

            if (!isInvalid) {
              let nextQuestionIndex;
              let isLast;

              const questionIndex = dataQuestionsTab?.findIndex(
                (item) => item.id == activeTab,
              );

              if (questionIndex < dataQuestionsTab?.length - 1) {
                nextQuestionIndex = questionIndex + 1;

                localStorage.setItem(
                  "activeTab",
                  dataQuestionsTab[nextQuestionIndex]?.id,
                );
                this.setState({
                  activeTab: dataQuestionsTab[nextQuestionIndex]?.id,
                });
              } else {
                isLast = true;
              }
            }
          }
          break;
      }
    } catch (err) {
      // Error handling
    }
  }

  updateTabQuestion(dataQuestionsTab, resultQuestion) {
    // == resultQuestion => for validate correct wrong or null ==

    // resultQuestion={
    //   id: '1',
    //   status: 'correct' | 'wrong' | null
    // }

    try {
      const {
        state: {},
        props: { head },
      } = this;

      const tabStatus = head?.tabs?.status;

      const refactorDataQuestionsTab = dataQuestionsTab?.map((item, index) => {
        const currentValidation = resultQuestion.find((v) => v.id == item?.id);

        const status = currentValidation?.accuracy ? "correct" : "wrong";

        let result = {
          ...item,
          ...tabStatus[status]?.tabItem,
        };

        return result;
      });

      return refactorDataQuestionsTab;
    } catch (err) {
      // Error handling
    }
  }

  getTimeDuration(dataTime, lastQuestion) {
    try {
      const newDataTime = dataTime?.map((item) => {
        let duration = 0;

        if (item?.timeEnd?.diff) {
          duration = item?.timeEnd.diff(item?.timeStart, "seconds");
        }

        if (item?.id == lastQuestion) {
          duration = dayjs().diff(item?.timeStart, "seconds") || 0;
        }

        return {
          ...item,
          duration,
        };
      });

      return newDataTime;
    } catch (err) {
      // Error handling
    }
  }

  categoryChange(value, cardElement) {
    const { selectedCategories } = this.state;
    // Check if category is already selected (before we toggle it)
    const isCurrentlySelected = this.isCategorySelected(value);

    let newData = [...(selectedCategories || [])];
    if (isCurrentlySelected) {
      newData = newData.filter((val) => val !== value);
    } else {
      newData.push(value);
    }

    // Trigger selection animation with the NEW state
    if (cardElement) {
      ExerciseAnimationController.animateCategoryCardSelection(
        cardElement,
        !isCurrentlySelected,
      );
    }

    this.setState({ selectedCategories: newData });
  }

  // Get emoji for category based on label or index
  getCategoryEmoji(category) {
    const emojiList = [
      "📐",
      "🔢",
      "📝",
      "📏",
      "➕",
      "➖",
      "➗",
      "✖️",
      "🔢",
      "📊",
      "🧮",
      "📈",
      "📉",
      "📚",
      "📖",
      "✏️",
    ];

    // Use category ID or index to get consistent emoji per category
    const index = category?.id || 0;
    return emojiList[index % emojiList.length];
  }

  isCategorySelected(value) {
    const { selectedCategories } = this.state;
    return selectedCategories?.some((val) => val === value);
  }

  async initialize() {
    try {
      const {
        state: {},
        props: { categoryValues },
      } = this;

      this.setState({
        selectedCategories: categoryValues,
      });
    } catch (err) {
      // Error handling
    }
  }

  async componentDidMount() {
    await this.initialize();

    // Disable scroll initially if we're not on the category screen
    if (this.state.activeScreen !== "category") {
      const contentMain = document.querySelector(".main-layout-content-main");
      if (contentMain) {
        this.contentMainFallbackScroll = contentMain.style.overflow;
        contentMain.style.overflow = "hidden";
      }
    }
  }

  componentWillUnmount() {
    // Stop TTS when component unmounts
    if (this.state.isSpeaking) {
      ttsManager.stop();
    }

    // Re-enable scroll when leaving the page
    const contentMain = document.querySelector(".main-layout-content-main");
    if (contentMain) {
      contentMain.style.overflow = this.contentMainFallbackScroll || "auto";
    }
  }
  async componentDidUpdate(prevProps, prevState) {
    // Toggle scroll based on activeScreen
    if (prevState.activeScreen !== this.state.activeScreen) {
      const contentMain = document.querySelector(".main-layout-content-main");
      if (contentMain) {
        if (this.state.activeScreen !== "category") {
          this.contentMainFallbackScroll =
            this.contentMainFallbackScroll || contentMain.style.overflow;
          contentMain.style.overflow = "hidden";
        } else {
          contentMain.style.overflow = this.contentMainFallbackScroll || "auto";
        }
      }
    }

    if (
      prevState.activeTab != this.state.activeTab &&
      prevState.activeTab >= 0
    ) {
      try {
        const newDataTime = [...(this.state.dataTime || [])];

        const foundIndex1 = newDataTime?.findIndex(
          (item) => item.id == prevState.activeTab,
        );
        const foundIndex2 = newDataTime?.findIndex(
          (item) => item.id == this.state.activeTab,
        );

        newDataTime[foundIndex1]["timeEnd"] = dayjs();
        newDataTime[foundIndex2]["timeStart"] =
          newDataTime[foundIndex2]["timeStart"] || dayjs();

        this.setState({
          dataTime: newDataTime,
        });

        // 3.5 - Question transition animation
        if (this.questionContainerRef.current) {
          ExerciseAnimationController.animateQuestionTransition(
            this.questionContainerRef.current,
          );
        }

        // Stop TTS when switching questions
        if (this.state.isSpeaking) {
          ttsManager.stop();
          this.setState({ isSpeaking: false });
        }
      } catch (err) {
        // Error handling
      }
    }

    if (
      this.props.dataQuestions != prevProps.dataQuestions ||
      this.props.dataQuestionsTab != prevProps.dataQuestionsTab
    ) {
      try {
        // Trigger staggered category reveal when data loads
        if (this.props.dataQuestions && !prevProps.dataQuestions) {
          setTimeout(() => {
            const validRefs = this.categoryCardsRefs.filter(
              (ref) => ref !== null,
            );
            if (validRefs.length > 0) {
              ExerciseAnimationController.animateCategoryCardsReveal(validRefs);
            }
          }, 100);
        }
      } catch (err) {
        // Error handling
      }
    }

    if (this.props.categoryValues != prevProps.categoryValues) {
      this.setState({
        selectedCategories: this.props.categoryValues,
      });

      // Start button pulse animation when categories are selected
      if (this.props.categoryValues && this.props.categoryValues.length > 0) {
        setTimeout(() => {
          if (this.startButtonRef.current) {
            ExerciseAnimationController.animateStartButtonPulse(
              this.startButtonRef.current,
            );
          }
        }, 100);
      }
    }

    // 3.1 - Trigger category reveal on screen change to category
    if (
      prevState.activeScreen !== this.state.activeScreen &&
      this.state.activeScreen === "category"
    ) {
      setTimeout(() => {
        const validRefs = this.categoryCardsRefs.filter((ref) => ref !== null);
        if (validRefs.length > 0) {
          ExerciseAnimationController.animateCategoryCardsReveal(validRefs);
        }
        // Start button pulse if categories are selected
        if (
          this.state.selectedCategories &&
          this.state.selectedCategories.length > 0
        ) {
          if (this.startButtonRef.current) {
            ExerciseAnimationController.animateStartButtonPulse(
              this.startButtonRef.current,
            );
          }
        }
      }, 200);
    }

    // 3.9 - Results screen entrance animation
    if (!prevState.scoreResult && this.state.scoreResult) {
      console.log(`🎊 Triggering results entrance animation`);

      // Trigger confetti on first results page visit based on accuracy (lazy-loaded)
      const accuracy = this.state.scoreResult?.percentage || 0;
      if (accuracy >= 50) {
        setTimeout(async () => {
          const { default: ConfettiManager } = await import(
            "@/app/utils/ConfettiManager"
          );
          ConfettiManager.fireworks();
          setTimeout(() => ConfettiManager.fireworks(), 3000);
          setTimeout(() => ConfettiManager.fireworks(), 6000);
        }, 500);
      } else {
        setTimeout(async () => {
          const { default: ConfettiManager } = await import(
            "@/app/utils/ConfettiManager"
          );
          ConfettiManager.sadEmojis();
        }, 500);
      }

      setTimeout(() => {
        const roundedPercentage = this.roundScore(
          this.state.scoreResult?.percentage || 0,
        );
        ExerciseAnimationController.animateResultsEntrance(
          this.mascotRef.current,
          null, // Score element (using percentage as primary metric)
          this.state.scoreResult?.overallScore || 0,
          this.percentageRef.current,
          roundedPercentage,
        );
      }, 300);

      // 3.13 - Results stats sequential animation (1s delay, then 0.5s between each)
      ExerciseAnimationController.animateResultsStats(
        this.timeStatsRef.current,
        this.accuracyStatsRef.current,
        this.starsStatsRef.current,
      );
    }
  }

  componentDidMount() {
    // Attach native wheel event listener on document body with passive: false
    document.body.addEventListener("wheel", this.handleWheelEvent, {
      passive: false,
    });
  }

  componentWillUnmount() {
    // Clean up event listener to prevent memory leaks
    document.body.removeEventListener("wheel", this.handleWheelEvent);
  }

  handleWheelEvent = (event) => {
    // Only handle scroll navigation on question screen
    if (this.state.activeScreen !== "question") {
      return;
    }

    // Check if scroll is happening within the grey question area
    const questionElement = event.target.closest(
      `.${this.state.mainClassName}-wrapper`,
    );
    if (!questionElement) {
      // If not scrolling within grey area, allow normal scroll behavior
      return;
    }

    // Check if the grey area itself is scrollable (has overflow)
    const isScrollable =
      questionElement.scrollHeight > questionElement.clientHeight;
    const isAtTop = questionElement.scrollTop === 0;
    const isAtBottom =
      questionElement.scrollTop + questionElement.clientHeight >=
      questionElement.scrollHeight - 1;

    // Allow internal scrolling if the area is scrollable
    if (isScrollable) {
      // Scroll up - if not at top, allow internal scroll
      if (event.deltaY < 0 && !isAtTop) {
        // Allow internal scroll
        return;
      }
      // Scroll down - if not at bottom, allow internal scroll
      if (event.deltaY > 0 && !isAtBottom) {
        // Allow internal scroll
        return;
      }
      // If at boundary, prevent to allow question navigation
    }

    // Prevent page scroll when at boundaries or if not scrollable
    event.preventDefault();
    event.stopPropagation();

    // DISABLED: Scroll navigation was too sensitive and accidentally switched questions
    // Keeping code for potential future re-enablement
    // this.handleScrollNavigation(event);
  };

  render() {
    const {
      state: {
        mainClassName,
        activeTab,
        activeScreen,
        dataResult,
        showLoader,
        showExerciseLoader,
        loadingButtonSaveCategory,
        loadingButtonStartExercise,
        scoreResult,
        openScoreResult,
        dataAnswer,
        modalDrawer,
        refreshLoader,
        dataQuestionsTab,
        dataQuestions,
        timeStart,
        timeEnd,
        startTimer,
      },
      props: { head, dataCategory, categoryValues, debugResponse },
    } = this;
    const startRes = this.formatStartEndTime(timeStart);
    const endRes = this.formatStartEndTime(timeEnd);

    const questionReady = dataQuestions?.length > 0;

    return (
      <ContentLayout title={head?.header?.title} hideTitle={true}>
        <Stack
          className={
            mainClassName +
            " " +
            (activeScreen == "loading" ? "screen-loading" : "")
          }
          component={"main"}
          spacing={2}
          padding={"1rem"}
          paddingBottom={"0px"}
          width={"100%"}
          margin={"auto"}
          sx={
            activeScreen == "loading"
              ? {
                  minHeight: "100vh",
                  display: "flex",
                  flexDirection: "column",
                }
              : activeScreen == "question"
                ? {
                    height: "100vh",
                    overflow: "hidden",
                  }
                : {}
          }
        >
          <Stack
            sx={{
              position: "relative",
              ...(activeScreen === "question" && {
                overflow: "hidden",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }),
            }}
          >
            {head ? (
              <>
                <Collapse in={Boolean(activeScreen == "category")}>
                  <Stack spacing={3} sx={{ position: "relative" }}>
                    {loadingButtonSaveCategory && (
                      <Stack
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          zIndex: 1000,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "10px",
                        }}
                      >
                        <Stack
                          justifyContent="center"
                          alignItems="center"
                          sx={{ width: "100%", height: "100%" }}
                        >
                          <Lottie
                            animationData={loadingAnimation}
                            loop={true}
                            style={{ width: 300, height: 300 }}
                          />
                        </Stack>
                      </Stack>
                    )}
                    <Typography
                      className="text-h2"
                      component={"h2"}
                      sx={{
                        fontFamily: "'Advercase', serif !important",
                        letterSpacing: "0.07rem",
                      }}
                    >
                      {getLabel({ name: "selectCategory" })}
                    </Typography>

                    <Stack
                      className={mainClassName + "-category"}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "1.25rem",
                        "@media (max-width: 768px)": {
                          gridTemplateColumns: "1fr",
                        },
                      }}
                    >
                      {dataCategory?.map((val, i) => {
                        if (this.isCategorySelected(val?.id)) {
                          return (
                            <Stack
                              onClick={(e) =>
                                this.categoryChange(val?.id, e.currentTarget)
                              }
                              key={i}
                              className={mainClassName + "-category-row-active"}
                              ref={(el) => (this.categoryCardsRefs[i] = el)}
                              onMouseEnter={(e) =>
                                ExerciseAnimationController.animateCategoryCardHover(
                                  e.currentTarget,
                                  true,
                                  true, // isSelected = true
                                )
                              }
                              onMouseLeave={(e) =>
                                ExerciseAnimationController.animateCategoryCardHover(
                                  e.currentTarget,
                                  false,
                                  true, // isSelected = true
                                )
                              }
                            >
                              <Typography
                                className={mainClassName + "-category-emoji"}
                                sx={{ fontSize: "1.5rem" }}
                              >
                                {this.getCategoryEmoji(val)}
                              </Typography>
                              <Typography
                                className={
                                  mainClassName + "-category-txt-active"
                                }
                              >
                                {val?.label}
                              </Typography>
                              <Stack
                                className={
                                  mainClassName + "-category-bullet-active"
                                }
                              />
                            </Stack>
                          );
                        } else {
                          return (
                            <Stack
                              onClick={(e) =>
                                this.categoryChange(val?.id, e.currentTarget)
                              }
                              key={i}
                              className={mainClassName + "-category-row"}
                              ref={(el) => (this.categoryCardsRefs[i] = el)}
                              onMouseEnter={(e) =>
                                ExerciseAnimationController.animateCategoryCardHover(
                                  e.currentTarget,
                                  true,
                                  false, // isSelected = false
                                )
                              }
                              onMouseLeave={(e) =>
                                ExerciseAnimationController.animateCategoryCardHover(
                                  e.currentTarget,
                                  false,
                                  false, // isSelected = false
                                )
                              }
                            >
                              <Typography
                                className={mainClassName + "-category-emoji"}
                                sx={{ fontSize: "1.5rem" }}
                              >
                                {this.getCategoryEmoji(val)}
                              </Typography>
                              <Typography
                                className={mainClassName + "-category-txt"}
                              >
                                {val?.label}
                              </Typography>
                              <Stack
                                className={mainClassName + "-category-bullet"}
                              />
                            </Stack>
                          );
                        }
                      })}
                    </Stack>

                    <Button
                      ref={this.startButtonRef}
                      label={getLabel({ name: "startExercise" })}
                      handleClick={this.handleEvent.bind(this, {
                        type: "start-excercise",
                      })}
                      sx={{
                        backgroundColor: "rgba(130,100,255, 0.8) !important",
                        "&:hover": {
                          backgroundColor: "rgba(0, 205, 210, 0.8) !important",
                        },
                        "&.MuiButton-root": {
                          border: "none !important",
                        },
                        "&.element-button": {
                          border: "none !important",
                        },
                        fontSize: "1.25rem !important",
                      }}
                    />
                  </Stack>
                </Collapse>

                <Collapse
                  in={Boolean(activeScreen == "loading")}
                  className={
                    activeScreen == "loading" ? "mui-collapse-height-full" : ""
                  }
                >
                  <Stack
                    spacing={1}
                    height={"100%"}
                    width={"100%"}
                    sx={
                      activeScreen == "loading"
                        ? {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            zIndex: 1000,
                            minHeight: "calc(100vh - 200px)",
                            flexGrow: 1,
                          }
                        : {}
                    }
                  >
                    <Stack
                      direction={"row"}
                      spacing={1}
                      justifyContent={"space-between"}
                    >
                      <Button
                        startIcon="ArrowBackIosNew"
                        label={getLabel({ name: "back" })}
                        handleClick={this.handleEvent.bind(this, {
                          type: "back",
                        })}
                        sx={{
                          gridAutoFlow: "column",
                          width: "fit-content",
                        }}
                        theme="secondary"
                      />
                      {
                        <Button
                          className={
                            !questionReady || loadingButtonStartExercise
                              ? "visibility-off"
                              : "visibility-on"
                          }
                          startIcon="ArrowForwardIosNew"
                          label={getLabel({ name: "startExercise" })}
                          handleClick={this.handleEvent.bind(this, {
                            type: "show-excercise",
                          })}
                          sx={{
                            gridAutoFlow: "column",
                            width: "fit-content",
                          }}
                          theme="primary"
                        />
                      }
                    </Stack>
                    {activeScreen == "loading" && (
                      <Stack className={"element-loader-graph card-flat"}>
                        {/* Lottie Loading Animation */}
                        <Stack
                          justifyContent="center"
                          alignItems="center"
                          mb={2}
                        >
                          <Lottie
                            animationData={loadingAnimation}
                            loop={true}
                            style={{ width: 200, height: 200 }}
                          />
                        </Stack>
                        <LoaderGraph
                          startLoader={
                            activeScreen == "loading" ? refreshLoader : null
                          }
                          handleClick={this.handleEvent.bind(this, {
                            type: "show-excercise",
                          })}
                          sx={{
                            minHeight: "500px",
                          }}
                          isFinish={
                            activeScreen == "loading" ? questionReady : null
                          }
                          setLoadingExerciseBtn={this.setLoadingExerciseBtn.bind(
                            this,
                          )}
                        />
                        <ScrollingText />
                      </Stack>
                    )}
                  </Stack>
                </Collapse>

                <Collapse in={Boolean(activeScreen == "question")}>
                  {dataQuestions && dataQuestionsTab && (
                    <Stack
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                        padding: "1rem 2rem",
                        position: "relative",
                        overflow: "hidden",
                        height: "100%",
                      }}
                    >
                      {/* 🎬 Lottie Animation Placeholders - Side Mascots */}
                      {/* Left Side Mascot */}
                      <Stack
                        className="lottie-placeholder-mascot-left"
                        sx={{
                          position: "absolute",
                          left: "-160px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "120px",
                          height: "150px",
                          border: "2px dashed #8264FF",
                          borderRadius: "12px",
                          backgroundColor: "rgba(130, 100, 255, 0.05)",
                          display: { xs: "none", md: "flex" },
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "#8264FF",
                          gap: 1,
                          zIndex: 10,
                        }}
                        data-animation-type="mascot-left"
                      >
                        <Typography fontSize={32}>🎬</Typography>
                        <Typography
                          fontSize={10}
                          fontWeight={500}
                          textAlign="center"
                          px={1}
                        >
                          Left Mascot Animation
                        </Typography>
                      </Stack>

                      {/* Right Side Mascot */}
                      <Stack
                        className="lottie-placeholder-mascot-right"
                        sx={{
                          position: "absolute",
                          right: "-160px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "120px",
                          height: "150px",
                          border: "2px dashed #8264FF",
                          borderRadius: "12px",
                          backgroundColor: "rgba(130, 100, 255, 0.05)",
                          display: { xs: "none", md: "flex" },
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "#8264FF",
                          gap: 1,
                          zIndex: 10,
                        }}
                        data-animation-type="mascot-right"
                      >
                        <Typography fontSize={32}>🎬</Typography>
                        <Typography
                          fontSize={10}
                          fontWeight={500}
                          textAlign="center"
                          px={1}
                        >
                          Right Mascot Animation
                        </Typography>
                      </Stack>

                      <Stack
                        className={mainClassName + "-header-question"}
                        sx={{ marginBottom: "0.5rem" }}
                      >
                        <Stack
                          direction="row"
                          alignItems={"center"}
                          width="100%"
                        >
                          <Typography
                            className={mainClassName + "-title"}
                            fontWeight={600}
                            color="#231F20"
                            sx={{
                              fontFamily: "'Advercase', serif !important",
                              letterSpacing: "0.07rem",
                              marginRight: "0.4rem",
                            }}
                          >
                            {locale(head?.header?.title)}
                          </Typography>

                          <Typography
                            className={mainClassName + "-title"}
                            fontWeight={400}
                            color="#231F20"
                            sx={{
                              fontFamily: "'Advercase', serif !important",
                              letterSpacing: "0.07rem",
                            }}
                          >
                            {dayjs().format("DD MMM YYYY, h:mm A")}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack
                        className={mainClassName + "-body"}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "100px 1fr 280px",
                          columnGap: "2.5rem",
                          rowGap: "1.5rem",
                          height: "calc(100vh - 200px)",
                          overflow: "hidden",
                          flex: 1,
                          alignItems: "start",
                        }}
                      >
                        {/* LEFT SIDEBAR - Vertical Question Navigation */}
                        <Stack sx={{ overflow: "hidden", paddingTop: "20px" }}>
                          <Stack spacing={0.5}>
                            {dataQuestionsTab?.map((tab, idx) => {
                              const isActive = activeTab === tab?.id;
                              // Determine correct/wrong status from scoreResult data
                              let isCorrect = false;
                              let isWrong = false;

                              if (scoreResult && tab?.id !== 1) {
                                // Exclude result tab
                                const questionResult =
                                  scoreResult?.dataQuestion?.find(
                                    (q) => q.id === tab?.id,
                                  );

                                // Fix: Convert accuracy to number to handle both string and number types
                                const accuracy = Number(
                                  questionResult?.accuracy,
                                );
                                isCorrect = accuracy === 1;
                                isWrong =
                                  accuracy < 1 &&
                                  questionResult?.accuracy !== undefined;
                              }

                              // Fallback to icon/className checks
                              if (!isCorrect && !isWrong) {
                                isCorrect =
                                  tab?.className?.includes("correct") ||
                                  tab?.icon === "CheckCircleOutline";
                                isWrong =
                                  tab?.className?.includes("wrong") ||
                                  tab?.icon === "HighlightOff";
                              }

                              // Check if this is the Result button (id === 1)
                              const isResultButton = tab?.id === 1;

                              return (
                                <>
                                  {isResultButton && <Stack height="24px" />}
                                  <Stack
                                    key={idx}
                                    onClick={() =>
                                      this.handleEvent({
                                        type: "switch-tab",
                                        value: tab?.id,
                                      })
                                    }
                                    sx={{
                                      marginTop: isResultButton ? "5rem" : "0",
                                      padding: "0.5rem 0.75rem",
                                      borderRadius: "6px",
                                      minHeight: "2.5rem",
                                      backgroundColor: isResultButton
                                        ? isActive
                                          ? "#8264FF"
                                          : "#8264FF"
                                        : isActive
                                          ? "#00CDD2"
                                          : isCorrect
                                            ? "#00CDD2"
                                            : isWrong
                                              ? "#FF5000"
                                              : "#F6F9FF",
                                      color:
                                        isResultButton ||
                                        isActive ||
                                        isCorrect ||
                                        isWrong
                                          ? "#fff"
                                          : "#231F20",
                                      cursor: "pointer",
                                      border: isResultButton
                                        ? isActive
                                          ? "none"
                                          : "1px solid #8264FF"
                                        : isActive
                                          ? "none"
                                          : isCorrect
                                            ? "1px solid #00CDD2"
                                            : isWrong
                                              ? "1px solid #FF5000"
                                              : "1px solid #E0E0E0",
                                      fontWeight: isActive ? 600 : 500,
                                      fontSize: "1.5rem",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      transition: "all 0.2s ease",
                                      "&:hover": {
                                        backgroundColor: isResultButton
                                          ? "#8264FF"
                                          : isActive
                                            ? "#00CDD2"
                                            : isCorrect
                                              ? "#00CDD2"
                                              : isWrong
                                                ? "#FF5000"
                                                : "#EDEDED",
                                      },
                                    }}
                                  >
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      {isCorrect && (
                                        <Typography sx={{ fontSize: "1.3rem" }}>
                                          ✓
                                        </Typography>
                                      )}
                                      {isWrong && (
                                        <Typography sx={{ fontSize: "1.3rem" }}>
                                          ✗
                                        </Typography>
                                      )}
                                      {!isCorrect && !isWrong && (
                                        <Typography sx={{ fontSize: "1rem" }}>
                                          ○
                                        </Typography>
                                      )}
                                      <Typography
                                        sx={{
                                          fontSize: "1.5rem",
                                          fontWeight: 500,
                                          fontFamily:
                                            "'Advercase', serif !important",
                                        }}
                                      >
                                        {tab?.label}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </>
                              );
                            })}
                          </Stack>
                        </Stack>

                        {/* CENTER CONTENT - Questions */}
                        <Stack
                          sx={{
                            padding: "20px",
                            overflow: "hidden",
                          }}
                        >
                          <Stack className={mainClassName + "-question "}>
                            {dataQuestions?.length > 0 &&
                              dataQuestions?.map((item, index) => {
                                const itemResult =
                                  scoreResult?.dataQuestion[index];

                                return (
                                  <Collapse
                                    key={mainClassName + "-question-" + index}
                                    in={activeTab == item.id}
                                    className={
                                      activeTab == item.id ? "active" : ""
                                    }
                                  >
                                    <Stack
                                      spacing={2}
                                      justifyContent={"flex-start"}
                                      justifyItems={"center"}
                                      alignItems={"center"}
                                      sx={{
                                        height: "calc(100vh - 240px)",
                                        maxHeight: "calc(100vh - 240px)",
                                        borderRadius: "10px",
                                        paddingTop: "2rem",
                                        overscrollBehavior: "contain",
                                        overflow: "auto",
                                        boxShadow:
                                          "0px 4px 16px 0px rgba(0, 0, 0, 0.28) !important",
                                      }}
                                      backgroundColor="#f6f9ff"
                                      className={mainClassName + "-wrapper"}
                                    >
                                      <Stack
                                        pt={5}
                                        style={{
                                          marginBottom: "-75px",
                                          zIndex: 1,
                                        }}
                                        width="85%"
                                      >
                                        {item?.id !== 1 && (
                                          <Typography
                                            color="#00CDD2"
                                            fontWeight={600}
                                            fontSize={36}
                                            sx={{
                                              fontFamily:
                                                "'Advercase', serif !important",
                                            }}
                                          >
                                            Q{index + 1}
                                            {dataQuestions?.length > 1
                                              ? `/${scoreResult ? dataQuestions?.length - 1 : dataQuestions?.length}`
                                              : ""}
                                          </Typography>
                                        )}
                                        <Stack
                                          mt={1}
                                          direction="row"
                                          width="100%"
                                        >
                                          {item?.id !== 1 && (
                                            <>
                                              <Stack
                                                direction="row"
                                                alignItems="center"
                                              >
                                                <Typography
                                                  color="#8D8D8D"
                                                  fontSize={14}
                                                  fontWeight={400}
                                                >
                                                  {locale(head?.category)}:
                                                </Typography>
                                                <Stack
                                                  className={
                                                    mainClassName +
                                                    "-question-info-pil"
                                                  }
                                                >
                                                  <Typography
                                                    color="#231F20"
                                                    fontSize={14}
                                                    fontWeight={400}
                                                  >
                                                    {this.getCategoryLabel(
                                                      item?.outer_category,
                                                    )}
                                                  </Typography>
                                                </Stack>
                                              </Stack>
                                              <Stack
                                                direction="row"
                                                alignItems="center"
                                              >
                                                <Typography
                                                  color="#8D8D8D"
                                                  fontSize={14}
                                                  fontWeight={400}
                                                >
                                                  {locale(head?.difficulty)}:
                                                </Typography>
                                                <Stack
                                                  className={
                                                    mainClassName +
                                                    "-question-info-pil"
                                                  }
                                                >
                                                  <Typography
                                                    color="#231F20"
                                                    fontSize={14}
                                                    fontWeight={400}
                                                  >
                                                    {this.getDifficultyLabel(
                                                      item?.difficulty,
                                                    )}
                                                  </Typography>
                                                </Stack>
                                              </Stack>
                                              {/* {!isProd && */}
                                              <Stack
                                                direction="row"
                                                alignItems="center"
                                                spacing={1}
                                              >
                                                <Typography
                                                  color="#8D8D8D"
                                                  fontSize={14}
                                                  fontWeight={400}
                                                >
                                                  {locale(head?.questionId)}:
                                                </Typography>
                                                <Stack
                                                  className={
                                                    mainClassName +
                                                    "-question-info-pil"
                                                  }
                                                >
                                                  <Typography
                                                    color="#231F20"
                                                    fontSize={14}
                                                    fontWeight={400}
                                                  >
                                                    {activeTab}
                                                  </Typography>
                                                </Stack>
                                                {/* TTS Speaker Icon */}
                                                {
                                                  // {ttsManager.isSupported() && (
                                                  //   <Stack
                                                  //     onClick={
                                                  //       this.handleTTSToggle
                                                  //     }
                                                  //     onMouseEnter={(e) => {
                                                  //       e.currentTarget.style.transform =
                                                  //         "scale(1.15)";
                                                  //     }}
                                                  //     onMouseLeave={(e) => {
                                                  //       e.currentTarget.style.transform =
                                                  //         "scale(1)";
                                                  //     }}
                                                  //     style={{
                                                  //       display: "inline-flex",
                                                  //       alignItems: "center",
                                                  //       cursor: "pointer",
                                                  //       userSelect: "none",
                                                  //       backgroundColor:
                                                  //         "rgba(0, 205, 210, 0.1)",
                                                  //       padding: "2px 4px",
                                                  //       borderRadius: "4px",
                                                  //       border:
                                                  //         "1px solid #00CDD2",
                                                  //       fontSize: "18px",
                                                  //       transition:
                                                  //         "transform 0.2s ease",
                                                  //       marginLeft: "8px",
                                                  //     }}
                                                  //   >
                                                  //     {/* {this.state.isSpeaking
                                                  //       ? "🔊"
                                                  //       : "🔇"} */}{" "}
                                                  //     hi
                                                  //   </Stack>
                                                  // )}
                                                }
                                                {scoreResult && (
                                                  <Tooltip
                                                    title={locale(
                                                      "Report an issue with this question",
                                                    )}
                                                  >
                                                    <IconButton
                                                      icon="flag"
                                                      size="md"
                                                      theme="light"
                                                      handleClick={() => {
                                                        this.playAlertSound();
                                                        this.setState({
                                                          showIssueDrawer: true,
                                                          targetIssueQuestionId:
                                                            item.id,
                                                        });
                                                      }}
                                                      sx={{
                                                        marginLeft: "8px",
                                                        backgroundColor:
                                                          "rgba(0, 0, 0, 0.05)",
                                                        "& .mui-icon": {
                                                          fontSize: "1.2rem",
                                                        },
                                                        "&:hover": {
                                                          backgroundColor:
                                                            "rgba(0, 0, 0, 0.1)",
                                                        },
                                                      }}
                                                    />
                                                  </Tooltip>
                                                )}
                                              </Stack>
                                              {/* } */}
                                            </>
                                          )}
                                        </Stack>
                                      </Stack>

                                      {item?.id !== 1 ? (
                                        <>
                                          {scoreResult ? (
                                            <RichText
                                              value={itemResult?.question}
                                              readOnly={true}
                                              key={itemResult?.elementKey}
                                              questionId={item.id}
                                            />
                                          ) : (
                                            <RichText
                                              refEditor={(instance) => {
                                                if (instance) {
                                                  this.refRichText[item.id] =
                                                    instance.getJSON();
                                                }
                                              }}
                                              value={item?.question}
                                              readOnly={true}
                                              questionId={item.id}
                                            />
                                          )}
                                        </>
                                      ) : (
                                        <Stack
                                          className={mainClassName + "-result"}
                                          sx={{
                                            justifyContent: "center",
                                            alignItems: "center",
                                            display: "flex",
                                            flexDirection: "column",
                                          }}
                                        >
                                          <Stack
                                            ref={this.mascotRef}
                                            style={{
                                              opacity: 0,
                                              transform:
                                                "translateY(100px) scale(0.5)",
                                            }}
                                          >
                                            <img
                                              src={this.getAccuracyGif(
                                                scoreResult?.percentage,
                                              )}
                                              alt="mascot"
                                              width={220}
                                              height={220}
                                              style={{
                                                width: "220px",
                                                height: "220px",
                                                objectFit: "contain",
                                              }}
                                            />
                                          </Stack>
                                          <Typography
                                            mt={2}
                                            color="#231F20"
                                            fontWeight={700}
                                            fontSize={19}
                                            sx={{
                                              fontFamily:
                                                "'Advercase', serif !important",
                                              letterSpacing: "0.07rem",
                                            }}
                                          >
                                            {scoreResult?.percentage === 0
                                              ? 'Bobby said: "I will never be this low ever again"'
                                              : `${this.getCharacterName(
                                                  scoreResult?.percentage,
                                                )} said: ${
                                                  scoreResult?.percentage > 50
                                                    ? locale(head?.congrats)
                                                    : locale(head?.tryHarder)
                                                }`}
                                          </Typography>
                                          <Typography
                                            mt={1}
                                            color="#8D8D8D"
                                            fontWeight={400}
                                            fontSize={14}
                                          >
                                            {scoreResult?.percentage > 50
                                              ? locale(head?.wishSuccess)
                                              : locale(head?.doBetter)}
                                          </Typography>

                                          <Stack direction="row" mt={5} mb={5}>
                                            <Stack
                                              ref={this.timeStatsRef}
                                              className={
                                                mainClassName +
                                                "-result-with-time"
                                              }
                                              style={{
                                                opacity: 0,
                                                transform:
                                                  "translateY(30px) scale(0.9)",
                                              }}
                                            >
                                              <Typography
                                                color="#fff"
                                                fontSize={14}
                                                mt={-1}
                                                mb={1}
                                                fontWeight={500}
                                              >
                                                {locale(head?.time)}
                                              </Typography>
                                              <Stack
                                                className={
                                                  mainClassName +
                                                  "-result-inner"
                                                }
                                              >
                                                <ImageHandler
                                                  src={require("@/images/icon/icon-clock-outline.svg")}
                                                  width={30}
                                                  height={30}
                                                />
                                                <Typography
                                                  color="#8264FF"
                                                  fontSize={24}
                                                  fontWeight={600}
                                                  sx={{
                                                    fontFamily:
                                                      "'Advercase', serif !important",
                                                    letterSpacing: "0.07rem",
                                                  }}
                                                >
                                                  {this.formatTime(
                                                    Math.floor(
                                                      (timeEnd - timeStart) /
                                                        1000,
                                                    ),
                                                  )}
                                                </Typography>
                                              </Stack>
                                            </Stack>

                                            <Stack
                                              ref={this.accuracyStatsRef}
                                              className={
                                                mainClassName +
                                                "-result-your-score"
                                              }
                                              style={{
                                                opacity: 0,
                                                transform:
                                                  "translateY(30px) scale(0.9)",
                                              }}
                                            >
                                              <Typography
                                                color="#fff"
                                                fontSize={14}
                                                mt={-1}
                                                mb={1}
                                                fontWeight={500}
                                              >
                                                {locale(head?.yourScore)}
                                              </Typography>
                                              <Stack
                                                className={
                                                  mainClassName +
                                                  "-result-inner"
                                                }
                                              >
                                                <Typography
                                                  color="#00CDD2"
                                                  fontSize={24}
                                                  fontWeight={600}
                                                  ref={this.percentageRef}
                                                  sx={{
                                                    fontFamily:
                                                      "'Advercase', serif !important",
                                                    letterSpacing: "0.07rem",
                                                  }}
                                                >
                                                  {this.roundScore(
                                                    scoreResult?.percentage,
                                                  )}
                                                  %
                                                </Typography>
                                              </Stack>
                                            </Stack>

                                            <Stack
                                              ref={this.starsStatsRef}
                                              className={
                                                mainClassName +
                                                "-result-star-coin"
                                              }
                                              style={{
                                                opacity: 0,
                                                transform:
                                                  "translateY(30px) scale(0.9)",
                                              }}
                                            >
                                              <Typography
                                                color="#fff"
                                                fontSize={14}
                                                mt={-1}
                                                mb={1}
                                                fontWeight={500}
                                              >
                                                {locale(head?.rewards)}
                                              </Typography>
                                              <Stack
                                                className={
                                                  mainClassName +
                                                  "-result-inner"
                                                }
                                              >
                                                {(() => {
                                                  const coins =
                                                    this.state.scoreResult
                                                      ?.coins_awarded ||
                                                    this.state.scoreResult
                                                      ?.payload
                                                      ?.coins_awarded ||
                                                    0;

                                                  const stars =
                                                    this.state.scoreResult
                                                      ?.dataQuestion?.length ||
                                                    0;

                                                  return (
                                                    <Stack
                                                      direction="row"
                                                      justifyContent="center"
                                                      alignItems="center"
                                                      gap={1}
                                                    >
                                                      {/* Coins */}
                                                      <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        gap={0}
                                                      >
                                                        <ImageHandler
                                                          src={"/Coin.svg"}
                                                          width={28}
                                                          height={28}
                                                        />
                                                        <Typography
                                                          color="#FF5000"
                                                          fontSize={24}
                                                          fontWeight={600}
                                                          sx={{
                                                            fontFamily:
                                                              "'Advercase', serif !important",
                                                            letterSpacing: "0.07rem",
                                                          }}
                                                        >
                                                          {coins}
                                                        </Typography>
                                                      </Stack>

                                                      {/* Stars */}
                                                      <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        gap={0}
                                                      >
                                                        <ImageHandler
                                                          src={"/Star.svg"}
                                                          width={28}
                                                          height={28}
                                                        />
                                                        <Typography
                                                          color="#FF5000"
                                                          fontSize={24}
                                                          fontWeight={600}
                                                          sx={{
                                                            fontFamily:
                                                              "'Advercase', serif !important",
                                                            letterSpacing: "0.07rem",
                                                          }}
                                                        >
                                                          {stars}
                                                        </Typography>
                                                      </Stack>
                                                    </Stack>
                                                  );
                                                })()}
                                              </Stack>
                                            </Stack>
                                          </Stack>

                                          {/* Removed duplicate Continue button (kept right sidebar version) */}
                                        </Stack>
                                      )}
                                    </Stack>
                                  </Collapse>
                                );
                              })}
                          </Stack>
                        </Stack>

                        {/* RIGHT SIDEBAR - Timer and Actions */}
                        <Stack
                          spacing={4}
                          display="flex"
                          flexDirection="column"
                          alignItems="stretch"
                          width="100%"
                          sx={{ overflow: "hidden", paddingTop: "20px" }}
                        >
                          <Stack
                            className={mainClassName + "-timer"}
                            width="100%"
                            sx={{
                              borderRadius: "10px !important",
                              backgroundColor: "#fff",
                              overflow: "hidden",
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="center"
                              alignItems="center"
                              width="100%"
                            >
                              <Stack alignItems="center" width="100%">
                                <Typography
                                  color="#8D8D8D"
                                  className={mainClassName + "-timer-txt-small"}
                                  fontWeight={500}
                                  textAlign="center"
                                >
                                  {locale(head?.spentTime)}
                                </Typography>
                                <QuestionTimer start={this.state.startTimer} />
                              </Stack>
                            </Stack>
                            <Stack
                              mt={3}
                              direction="row"
                              alignItems="center"
                              justifyContent="center"
                              width="100%"
                              px={1}
                            >
                              <Stack flex={1} alignItems="center">
                                <Typography
                                  color="#8D8D8D"
                                  className={mainClassName + "-timer-txt-small"}
                                  fontWeight={400}
                                  textAlign="center"
                                >
                                  Start time
                                </Typography>
                                <Stack direction="row" mt={1}>
                                  <Stack
                                    className={
                                      mainClassName + "-timer-time-wrapper"
                                    }
                                  >
                                    <Typography
                                      className={
                                        mainClassName + "-timer-txt-regular"
                                      }
                                      fontWeight={400}
                                    >
                                      {startRes?.hours[0]}
                                    </Typography>
                                  </Stack>
                                  <Stack
                                    className={
                                      mainClassName + "-timer-time-wrapper"
                                    }
                                  >
                                    <Typography
                                      className={
                                        mainClassName + "-timer-txt-regular"
                                      }
                                      fontWeight={400}
                                    >
                                      {startRes?.hours[1]}
                                    </Typography>
                                  </Stack>
                                  <Typography
                                    className={
                                      mainClassName + "-timer-txt-regular"
                                    }
                                    fontWeight={400}
                                  >
                                    :
                                  </Typography>
                                  <Stack
                                    className={
                                      mainClassName + "-timer-time-wrapper"
                                    }
                                  >
                                    <Typography
                                      className={
                                        mainClassName + "-timer-txt-regular"
                                      }
                                      fontWeight={400}
                                    >
                                      {startRes?.minutes[0]}
                                    </Typography>
                                  </Stack>
                                  <Stack
                                    className={
                                      mainClassName + "-timer-time-wrapper"
                                    }
                                  >
                                    <Typography
                                      className={
                                        mainClassName + "-timer-txt-regular"
                                      }
                                      fontWeight={400}
                                    >
                                      {startRes?.minutes[1]}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </Stack>
                              <Stack flex={1} alignItems="center">
                                <Typography
                                  className={mainClassName + "-timer-txt-small"}
                                  fontWeight={600}
                                  sx={{
                                    fontFamily: "'Advercase', serif !important",
                                    letterSpacing: "0.07rem",
                                  }}
                                >
                                  {dayjs().format("h:mm A")}
                                </Typography>
                                <Stack
                                  mt={1}
                                  className={mainClassName + "-timer-progress"}
                                >
                                  <ProgressBar
                                    startTime={timeStart}
                                    running={startTimer}
                                    maxDuration={20 * 60} // 20 min default
                                  />
                                </Stack>
                              </Stack>
                              <Stack flex={1} alignItems="center">
                                <Typography
                                  color="#8D8D8D"
                                  className={mainClassName + "-timer-txt-small"}
                                  fontWeight={400}
                                  textAlign="center"
                                >
                                  End time
                                </Typography>
                                <Stack direction="row" mt={1}>
                                  <Stack
                                    className={
                                      mainClassName + "-timer-time-wrapper"
                                    }
                                  >
                                    <Typography
                                      className={
                                        mainClassName + "-timer-txt-regular"
                                      }
                                      fontWeight={400}
                                    >
                                      {endRes?.hours[0]}
                                    </Typography>
                                  </Stack>
                                  <Stack
                                    className={
                                      mainClassName + "-timer-time-wrapper"
                                    }
                                  >
                                    <Typography
                                      className={
                                        mainClassName + "-timer-txt-regular"
                                      }
                                      fontWeight={400}
                                    >
                                      {endRes?.hours[1]}
                                    </Typography>
                                  </Stack>
                                  <Typography
                                    className={
                                      mainClassName + "-timer-txt-regular"
                                    }
                                    fontWeight={400}
                                  >
                                    :
                                  </Typography>
                                  <Stack
                                    className={
                                      mainClassName + "-timer-time-wrapper"
                                    }
                                  >
                                    <Typography
                                      className={
                                        mainClassName + "-timer-txt-regular"
                                      }
                                      fontWeight={400}
                                    >
                                      {endRes?.minutes[0]}
                                    </Typography>
                                  </Stack>
                                  <Stack
                                    className={
                                      mainClassName + "-timer-time-wrapper"
                                    }
                                  >
                                    <Typography
                                      className={
                                        mainClassName + "-timer-txt-regular"
                                      }
                                      fontWeight={400}
                                    >
                                      {endRes?.minutes[1]}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </Stack>
                            </Stack>
                          </Stack>
                          {scoreResult && <Stack sx={{ height: "20px" }} />}
                          {scoreResult && (
                            <Button
                              className="submit-cta-effect"
                              label={locale(head?.continue2)}
                              handleClick={async () =>
                                await this.handleEvent({
                                  type: "try-again",
                                })
                              }
                              sx={{
                                width: "100%",
                                mt: 0,
                                mb: 0,
                                fontSize: "1.5rem !important",
                                fontFamily: "'Advercase', serif !important",
                                letterSpacing: "0.07rem",
                                lineHeight: 1,
                              }}
                            />
                          )}
                          {/* Sikao Animation - Show only on question tabs (Q1-Q5), not on results tab */}
                          {scoreResult && activeTab !== 1 && (
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                mt: "-30px",
                                position: "relative",
                                zIndex: 1,
                              }}
                              style={{ marginTop: "-30px" }}
                            >
                              <Box
                                onClick={this.openPotterModalAction.bind(this)}
                                sx={{
                                  width: "300px",
                                  height: "300px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  cursor: "pointer",
                                  position: "relative",
                                  "&:hover": {
                                    opacity: 0.9,
                                  },
                                }}
                              >
                                <Lottie
                                  animationData={sikaoAnimation}
                                  loop={true}
                                  style={{ width: "100%", height: "100%" }}
                                />
                              </Box>
                              {/* Speech Bubble - "Ask me!" - Positioned on right side with 30deg rotation */}
                              <Box
                                sx={{
                                  position: "absolute",
                                  right: "calc(50% - 120px)",
                                  top: "20%",
                                  transform: "rotate(30deg)",
                                  animation: "bounce 2s ease-in-out infinite",
                                  "@keyframes bounce": {
                                    "0%, 100%": {
                                      transform: "rotate(30deg) translateY(0)",
                                    },
                                    "50%": {
                                      transform:
                                        "rotate(30deg) translateY(-8px)",
                                    },
                                  },
                                  zIndex: 2,
                                }}
                              >
                                <Box
                                  sx={{
                                    backgroundColor: "#8264ff",
                                    color: "#fff",
                                    padding: "12px 20px",
                                    borderRadius: "20px",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    boxShadow:
                                      "0 4px 12px rgba(130, 100, 255, 0.3)",
                                    position: "relative",
                                    "&::after": {
                                      content: '""',
                                      position: "absolute",
                                      bottom: "-6px",
                                      left: "15px",
                                      transform: "rotate(-30deg)",
                                      width: 0,
                                      height: 0,
                                      borderStyle: "solid",
                                      borderWidth: "10px 6px 0 6px",
                                      borderColor:
                                        "#8264ff transparent transparent transparent",
                                    },
                                  }}
                                >
                                  Ask me!
                                </Box>
                              </Box>
                            </Box>
                          )}
                          {/* Keep existing button logic below */}
                          {/* Action Buttons */}
                          <Stack spacing={1} sx={{ width: "100%" }}>
                            {(() => {
                              // Find current question index
                              const currentTabIndex =
                                dataQuestionsTab?.findIndex(
                                  (tab) => tab.id === activeTab,
                                );
                              // Check if current tab is the last question tab (not result tab)
                              // Look for the last tab that has a numeric ID (question tabs)
                              const questionTabs = dataQuestionsTab?.filter(
                                (tab) =>
                                  tab?.id &&
                                  !isNaN(parseInt(tab.id)) &&
                                  tab.id !== "1", // exclude result tab (id: 1)
                              );
                              const lastQuestionTab =
                                questionTabs?.[questionTabs.length - 1];
                              const isLastQuestion =
                                activeTab === lastQuestionTab?.id;

                              if (!scoreResult) {
                                if (isLastQuestion) {
                                  // Show Submit All on the last question (Q5)
                                  return (
                                    <>
                                      <Button
                                        ref={this.submitButtonRef}
                                        headType="submitAll"
                                        className="submit-cta-effect"
                                        handleClick={() =>
                                          this.handleEvent({
                                            type: "submit",
                                          })
                                        }
                                        sx={{
                                          width: "100%",
                                          fontSize: "1.5rem !important",
                                          lineHeight: 1,
                                          ...fieryHoverSx,
                                          borderRadius: "10px",
                                          "&::before": { borderRadius: "12px" },
                                        }}
                                      />
                                      <ModalConfirm headType={"submitAnswer"} />
                                    </>
                                  );
                                } else if (
                                  currentTabIndex >= 0 &&
                                  !isLastQuestion
                                ) {
                                  // Show Next for Q1-Q4
                                  return (
                                    <Button
                                      headType={"next"}
                                      handleClick={() => {
                                        this.handleEvent({
                                          type: "next-question",
                                        });
                                      }}
                                      sx={{
                                        width: "100%",
                                        borderRadius: "10px",
                                        fontSize: "1.5rem !important",
                                        lineHeight: 1,
                                      }}
                                    />
                                  );
                                }
                              }

                              // On results page, primary Continue is shown above under timer

                              return null;
                            })()}
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  )}
                </Collapse>
              </>
            ) : (
              <Skeleton type={"dashboard"} />
            )}
          </Stack>

          <Stack
            className={mainClassName + "-blank"}
            sx={
              activeScreen == "loading"
                ? {
                    flexGrow: 1,
                    minHeight: 0,
                  }
                : activeScreen == "question"
                  ? {
                      display: "none",
                    }
                  : {}
            }
          />

          <div
            className={mainClassName + "-decor-image-bottom-1000"}
            style={
              activeScreen == "loading"
                ? {
                    flexShrink: 0,
                    marginTop: "auto",
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1856 / 460.8",
                    overflow: "hidden",
                    borderRadius: "12px",
                  }
                : activeScreen == "question"
                  ? {
                      display: "none",
                    }
                  : {
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1856 / 460.8",
                      overflow: "hidden",
                      borderRadius: "12px",
                    }
            }
          >
            <Image
              src="/images/banner/image.png"
              alt="Pebbo Banner"
              fill
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          <div
            className={mainClassName + "-decor-image-bottom-650"}
            style={
              activeScreen == "loading"
                ? {
                    flexShrink: 0,
                    marginTop: "auto",
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1856 / 460.8",
                    overflow: "hidden",
                    borderRadius: "12px",
                  }
                : activeScreen == "question"
                  ? {
                      display: "none",
                    }
                  : {
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1856 / 460.8",
                      overflow: "hidden",
                      borderRadius: "12px",
                    }
            }
          >
            <Image
              src="/images/banner/image.png"
              alt="Pebbo Banner"
              fill
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          <Loader
            isOpen={showLoader}
            resetModal={() => this.openLoader(false)}
          />
          <ExerciseLoader
            isOpen={showExerciseLoader}
            resetModal={() => this.setState({ showExerciseLoader: false })}
          />
          <Loader isOpen={this.state.loadingPotterInit} />

          {this.state.loadingPotterInit === false && (
            <RichTextTextModalComponent
              openModal={this.state.openPotterModal}
              setOpenModal={(isOpen) =>
                this.setState({ openPotterModal: isOpen })
              }
              historyChat={this.state.potterHistoryChat}
              clickPosition={this.state.potterClickPosition}
            />
          )}

          <IssueReportDrawer
            isOpen={this.state.showIssueDrawer}
            onClose={() => this.setState({ showIssueDrawer: false })}
            questionId={this.state.targetIssueQuestionId}
          />

          {/* <ModalDrawer
            {...(modalDrawer || {})}
            useButton={{
              label: getLabel({ name: 'tryAgain' }),
              handleClick: async () => await this.handleEvent({
                type: 'try-again'
              })
            }}
            anchor='bottom'
          /> */}
        </Stack>
      </ContentLayout>
    );
  }
}
export default connect(null, { assignMainLayout })(QuestionPage);
