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
import Image from "next/image";
import * as QuestionPageUtils from "./questionPageUtils";
import { buildInitialQuestionState } from "./hooks/useQuestionData";

const RichText = dynamic(
  () =>
    import("../../sections/richText").then((m) => ({ default: m.RichText })),
  { ssr: false },
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
import CategoryScreen from "./screens/CategoryScreen";
import LoadingScreen from "./screens/LoadingScreen";
import QuestionScreen from "./screens/QuestionScreen";
import UserAPI from "@/src/app/data/api/UserAPI";
import Tooltip from "@/elements/tooltip/Tooltip";
import ExerciseAnimationController from "@/app/utils/ExerciseAnimationController";
import ttsManager from "@/app/utils/TextToSpeechManager";
import React from "react";
import loadingAnimation from "@/assets/animations/Loading_Screen_Bobby_Surfing.json";
import sikaoAnimation from "@/assets/animations/xuexi.json";
import { trackEvent } from "@/app/hooks/useActivityTracker";

// Lazy-load heavy components (drawer, modal, Lottie) to reduce initial bundle
const IssueReportDrawer = dynamic(
  () => import("@/elements").then((m) => ({ default: m.IssueReportDrawer })),
  { ssr: false },
);

const RichTextTextModalComponent = dynamic(
  () =>
    import("@/app/components/sections/richText/extensions/modal").then((m) => ({
      default: m.RichTextTextModalComponent,
    })),
  { ssr: false },
);

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import ProgressBar from "./ProgressBar";
import { fieryHoverSx } from "@/components/elements/styles/fieryHover";
import {
  sound0Result,
  sound20_40Result,
  sound60_80Result,
  sound100Result,
  soundNextExercise,
  soundAskPotter,
  soundIncorrectAnswer,
  soundAlert,
} from "./questionPageConstants";

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
                const animateIncomplete =
                  this.props.effects?.animateIncompleteAnswer ??
                  ExerciseAnimationController.animateIncompleteAnswer.bind(
                    ExerciseAnimationController,
                  );
                animateIncomplete(targetField);
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
        props: { head, selectedCategories: controlledSelectedCategories },
      } = this;

      const effectiveSelectedCategories =
        controlledSelectedCategories != null
          ? controlledSelectedCategories
          : selectedCategories;

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
              const animateSubmit =
                this.props.effects?.animateSubmitButton ??
                ExerciseAnimationController.animateSubmitButton.bind(
                  ExerciseAnimationController,
                );
              animateSubmit(this.submitButtonRef.current, () => {
                console.log("✅ Submit animation complete");
              });
            }

            this.setState({ timeEnd: new Date(), startTimer: false });

            // Delegate to useQuestionResults hook when provided (QuestionPageV2)
            if (this.props.onSubmitFromHook) {
              setTimeout(async () => {
                document
                  ?.querySelector(".content-layout-main")
                  ?.scrollIntoView();
                const ctx = {
                  dataAnswer: this.state.dataAnswer,
                  dataTime: this.state.dataTime,
                  activeTab,
                  dataQuestions,
                  dataQuestionsTab,
                  head: this.props.head,
                  refRichText: this.refRichText,
                  activeScreen: this.state.activeScreen,
                  mainClassName: this.state.mainClassName,
                };
                const updates = await this.props.onSubmitFromHook(ctx);
                if (updates) this.setState(updates);
              }, 100);
              break;
            }

            // Wait for validation before proceeding
            setTimeout(async () => {
              document?.querySelector(".content-layout-main")?.scrollIntoView();

              const dataTime = QuestionPageUtils.getTimeDuration(
                this.state.dataTime,
                activeTab,
              );

              const { isInvalid, dataAnswer } = await this.assignDataAnswer(
                activeTab,
                null,
                true,
              );

              if (!isInvalid && this.props.postCompleteQuestion) {
                (dataAnswer || []).forEach((answerItem) => {
                  if (!answerItem?.id || answerItem.id === 1) return;
                  const timing = (dataTime || []).find(
                    (timeItem) => timeItem?.id == answerItem.id,
                  );

                  trackEvent("question_attempted", {
                    question_id: Number(answerItem.id),
                    metadata: {
                      is_invalid: !!answerItem?.isInvalid,
                      time_taken:
                        timing?.duration ?? timing?.timeTaken ?? timing ?? null,
                    },
                  });
                });

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

                // Trigger coin animation AFTER successful API call.
                // Pass the authoritative DB total (already includes the award)
                // so the chip lands exactly on the DB value, never drifting.
                if (window.triggerCoinIncrement) {
                  const coinsAwarded = apiResponse?.coins_awarded || 0;
                  if (coinsAwarded > 0) {
                    window.triggerCoinIncrement(
                      coinsAwarded,
                      apiResponse?.total_coins,
                    );
                  }
                }

                // Update the star chip instantly to the authoritative DB total.
                if (apiResponse?.total_stars != null) {
                  Auth.syncStars(apiResponse.total_stars);
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
                const playResult =
                  this.props.effects?.playResultSound ??
                  this.playResultSound.bind(this);
                playResult(scoreResult?.percentage);

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
            const playNext =
              this.props.effects?.playNextExerciseSound ??
              this.playNextExerciseSound.bind(this);
            playNext();

            // Don't clear state - keep previous content visible
            // Just show loading screen on top
            this.refRichText = {};

            // Show loading screen overlay
            this.setState({
              showExerciseLoader: true,
            });

            // Run setCategory + getQuestion in parallel (getQuestion passes categories so backend doesn't need to wait for setCategory)
            const { dataCategory } = this.props;
            const [_, newData] = await Promise.all([
              this.props.setCategory(effectiveSelectedCategories),
              this.props.getQuestion(effectiveSelectedCategories, dataCategory),
            ]);

            if (newData?.dataQuestions?.length > 0) {
              const seeded = buildInitialQuestionState({
                questions: newData?.dataQuestions,
                tabs: newData?.dataQuestionsTab,
              });

              if (seeded) {
                const { dataAnswer, dataTime, activeTab } = seeded;

                localStorage.setItem("activeTab", activeTab);

                this.props.clearQuestion();
                this.setState({
                  scoreResult: null,
                  dataAnswer,
                  dataTime,
                  activeTab,
                  dataQuestions: seeded.dataQuestions,
                  dataQuestionsTab: seeded.dataQuestionsTab,
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
                this.setState({ showExerciseLoader: false });
              }
            } else {
              Helpers.openSnackbar();
              this.setState({ showExerciseLoader: false });
            }
          }
          break;

        case "change-category":
          {
            const { onCategoryToggle } = this.props;
            if (onCategoryToggle) {
              onCategoryToggle(params?.value);
            } else {
              this.setState({
                selectedCategories: params?.value,
              });
            }
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
            // Show loading UI immediately (don't wait for animation)
            const validRefs = this.categoryCardsRefs.filter(
              (ref) => ref !== null,
            );
            this.setState({ showExerciseLoader: true });
            if (validRefs.length > 0) {
              const animateFadeOut =
                this.props.effects?.animateCategoriesFadeOut ??
                ExerciseAnimationController.animateCategoriesFadeOut.bind(
                  ExerciseAnimationController,
                );
              animateFadeOut(validRefs);
            }

            // 3.2 - Start button click animation (runs in parallel with API)
            if (this.startButtonRef.current) {
              const stopPulse =
                this.props.effects?.stopStartButtonPulse ??
                ExerciseAnimationController.stopStartButtonPulse.bind(
                  ExerciseAnimationController,
                );
              const animateClick =
                this.props.effects?.animateStartButtonClick ??
                ExerciseAnimationController.animateStartButtonClick.bind(
                  ExerciseAnimationController,
                );
              stopPulse(this.startButtonRef.current);
              animateClick(this.startButtonRef.current, () => {});
            }

            this.setLoadingExerciseBtn(true);

            if (effectiveSelectedCategories?.length > 0) {
              const isLoaderDisplayedBefore = localStorage.getItem("loader");

              if (isLoaderDisplayedBefore) {
                nProgress.start();
              }

              // Run setCategory + getQuestion in parallel (getQuestion passes categories so backend doesn't need to wait for setCategory)
              const { dataCategory } = this.props;
              const [_, newData] = await Promise.all([
                this.props.setCategory(effectiveSelectedCategories),
                this.props.getQuestion(
                  effectiveSelectedCategories,
                  dataCategory,
                ),
              ]);

              if (newData?.dataQuestions?.length > 0) {
                const seeded = buildInitialQuestionState({
                  questions: newData?.dataQuestions,
                  tabs: newData?.dataQuestionsTab,
                });

                if (seeded) {
                  const { dataAnswer, dataTime, activeTab } = seeded;

                  localStorage.setItem("activeTab", activeTab);

                  this.setState({
                    questionReady: true,
                    activeTab,
                    dataAnswer,
                    dataTime,
                    dataQuestions: seeded.dataQuestions,
                    dataQuestionsTab: seeded.dataQuestionsTab,
                  });
                } else {
                  Helpers.openSnackbar();
                }
              } else {
                Helpers.openSnackbar();
              }

              if (isLoaderDisplayedBefore) {
                nProgress.done();
              }
              setTimeout(() => {
                this.setState({
                  activeScreen: "question",
                  timeStart: new Date(),
                  startTimer: true,
                  showExerciseLoader: false,
                });
              }, 100);
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

  categoryChange(value, cardElement) {
    const {
      selectedCategories: controlledSelectedCategories,
      onCategoryToggle,
    } = this.props;

    const baseSelected =
      controlledSelectedCategories != null
        ? controlledSelectedCategories
        : this.state.selectedCategories;

    // Check if category is already selected (before we toggle it)
    const isCurrentlySelected = baseSelected?.some((val) => val === value);

    let newData = [...(baseSelected || [])];
    if (isCurrentlySelected) {
      newData = newData.filter((val) => val !== value);
    } else {
      newData.push(value);
    }

    // Trigger selection animation with the NEW state
    if (cardElement) {
      const animateSelection =
        this.props.effects?.animateCategoryCardSelection ??
        ExerciseAnimationController.animateCategoryCardSelection.bind(
          ExerciseAnimationController,
        );
      animateSelection(cardElement, !isCurrentlySelected);
    }

    if (onCategoryToggle) {
      onCategoryToggle(value);
    } else {
      this.setState({ selectedCategories: newData });
    }
  }

  isCategorySelected(value) {
    const { selectedCategories: controlledSelectedCategories } = this.props;
    const baseSelected =
      controlledSelectedCategories != null
        ? controlledSelectedCategories
        : this.state.selectedCategories;

    return baseSelected?.some((val) => val === value);
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

    // Preload ONNX model for faster first "Start Exercise" click
    QuestionsAPI.preloadModel();

    // Disable scroll initially if we're not on the category screen
    if (this.state.activeScreen !== "category") {
      const contentMain = document.querySelector(".main-layout-content-main");
      if (contentMain) {
        this.contentMainFallbackScroll = contentMain.style.overflow;
        contentMain.style.overflow = "hidden";
      }
    }

    document.body.addEventListener("wheel", this.handleWheelEvent, {
      passive: false,
    });
  }

  componentWillUnmount() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const isSpeaking = this.props.effects?.isSpeaking ?? this.state.isSpeaking;
    if (isSpeaking) {
      if (this.props.effects?.stopTTS) {
        this.props.effects.stopTTS();
      } else {
        ttsManager.stop();
        this.setState({ isSpeaking: false });
      }
    }
    const contentMain = document.querySelector(".main-layout-content-main");
    if (contentMain) {
      contentMain.style.overflow = this.contentMainFallbackScroll || "auto";
    }
    document.body.removeEventListener("wheel", this.handleWheelEvent);
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
        const currentQuestion = (this.state.dataQuestions || []).find(
          (question) => question?.id == this.state.activeTab,
        );
        if (currentQuestion && this.state.activeTab !== 1) {
          trackEvent("question_viewed", {
            question_id: Number(currentQuestion.id),
            metadata: {
              grade: currentQuestion?.grade ?? null,
              category: currentQuestion?.outer_category ?? null,
            },
          });
        }

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
          const animateTransition =
            this.props.effects?.animateQuestionTransition ??
            ExerciseAnimationController.animateQuestionTransition.bind(
              ExerciseAnimationController,
            );
          animateTransition(this.questionContainerRef.current);
        }

        // Stop TTS when switching questions
        const isSpeaking =
          this.props.effects?.isSpeaking ?? this.state.isSpeaking;
        if (isSpeaking) {
          if (this.props.effects?.stopTTS) {
            this.props.effects.stopTTS();
          } else {
            ttsManager.stop();
            this.setState({ isSpeaking: false });
          }
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
              const animateReveal =
                this.props.effects?.animateCategoryCardsReveal ??
                ExerciseAnimationController.animateCategoryCardsReveal.bind(
                  ExerciseAnimationController,
                );
              animateReveal(validRefs);
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
            const animatePulse =
              this.props.effects?.animateStartButtonPulse ??
              ExerciseAnimationController.animateStartButtonPulse.bind(
                ExerciseAnimationController,
              );
            animatePulse(this.startButtonRef.current);
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
        const animateReveal =
          this.props.effects?.animateCategoryCardsReveal ??
          ExerciseAnimationController.animateCategoryCardsReveal.bind(
            ExerciseAnimationController,
          );
        const animatePulse =
          this.props.effects?.animateStartButtonPulse ??
          ExerciseAnimationController.animateStartButtonPulse.bind(
            ExerciseAnimationController,
          );
        if (validRefs.length > 0) {
          animateReveal(validRefs);
        }
        // Start button pulse if categories are selected
        const { selectedCategories: controlledSelectedCategories } = this.props;
        const baseSelected =
          controlledSelectedCategories != null
            ? controlledSelectedCategories
            : this.state.selectedCategories;

        if (baseSelected && baseSelected.length > 0) {
          if (this.startButtonRef.current) {
            animatePulse(this.startButtonRef.current);
          }
        }
      }, 200);
    }

    if (
      prevState.activeScreen !== "question" &&
      this.state.activeScreen === "question" &&
      this.state.activeTab
    ) {
      const firstQuestion = (this.state.dataQuestions || []).find(
        (question) => question?.id == this.state.activeTab,
      );
      if (firstQuestion && this.state.activeTab !== 1) {
        trackEvent("question_viewed", {
          question_id: Number(firstQuestion.id),
          metadata: {
            grade: firstQuestion?.grade ?? null,
            category: firstQuestion?.outer_category ?? null,
          },
        });
      }
    }

    // 3.9 - Results screen entrance animation
    if (!prevState.scoreResult && this.state.scoreResult) {
      console.log(`🎊 Triggering results entrance animation`);

      setTimeout(() => {
        const roundedPercentage = QuestionPageUtils.roundScore(
          this.state.scoreResult?.percentage || 0,
        );
        const animateEntrance =
          this.props.effects?.animateResultsEntrance ??
          ExerciseAnimationController.animateResultsEntrance.bind(
            ExerciseAnimationController,
          );
        animateEntrance(
          this.mascotRef.current,
          null, // Score element (using percentage as primary metric)
          this.state.scoreResult?.overallScore || 0,
          this.percentageRef.current,
          roundedPercentage,
        );
      }, 300);

      // 3.13 - Results stats sequential animation (1s delay, then 0.5s between each)
      const animateStats =
        this.props.effects?.animateResultsStats ??
        ExerciseAnimationController.animateResultsStats.bind(
          ExerciseAnimationController,
        );
      animateStats(
        this.timeStatsRef.current,
        this.accuracyStatsRef.current,
        this.starsStatsRef.current,
      );
    }
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
    const startRes = QuestionPageUtils.formatStartEndTime(timeStart);
    const endRes = QuestionPageUtils.formatStartEndTime(timeEnd);

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
                  <CategoryScreen
                    mainClassName={mainClassName}
                    dataCategory={dataCategory}
                    loadingButtonSaveCategory={loadingButtonSaveCategory}
                    categoryCardsRefs={this.categoryCardsRefs}
                    startButtonRef={this.startButtonRef}
                    onCategoryChange={(id, el) => this.categoryChange(id, el)}
                    isCategorySelected={(val) => this.isCategorySelected(val)}
                    getCategoryEmoji={QuestionPageUtils.getCategoryEmoji}
                    onStartExercise={() =>
                      this.handleEvent({ type: "start-excercise" })
                    }
                  />
                </Collapse>

                <Collapse
                  in={Boolean(activeScreen == "loading")}
                  className={
                    activeScreen == "loading" ? "mui-collapse-height-full" : ""
                  }
                >
                  <LoadingScreen
                    activeScreen={activeScreen}
                    questionReady={questionReady}
                    loadingButtonStartExercise={loadingButtonStartExercise}
                    refreshLoader={refreshLoader}
                    onBack={() => this.handleEvent({ type: "back" })}
                    onShowExercise={() =>
                      this.handleEvent({ type: "show-excercise" })
                    }
                    setLoadingExerciseBtn={(bool) =>
                      this.setLoadingExerciseBtn(bool)
                    }
                  />
                </Collapse>

                <Collapse in={Boolean(activeScreen == "question")}>
                  {dataQuestions && dataQuestionsTab && (
                    <QuestionScreen
                      mainClassName={mainClassName}
                      head={head}
                      activeTab={activeTab}
                      dataQuestions={dataQuestions}
                      dataQuestionsTab={dataQuestionsTab}
                      scoreResult={scoreResult}
                      dataCategory={dataCategory}
                      dataAnswer={dataAnswer}
                      timeStart={timeStart}
                      timeEnd={timeEnd}
                      startTimer={startTimer}
                      refRichText={this.refRichText}
                      onRefRichText={(id, json) => {
                        this.refRichText[id] = json;
                      }}
                      mascotRef={this.mascotRef}
                      percentageRef={this.percentageRef}
                      timeStatsRef={this.timeStatsRef}
                      accuracyStatsRef={this.accuracyStatsRef}
                      starsStatsRef={this.starsStatsRef}
                      submitButtonRef={this.submitButtonRef}
                      nextButtonRef={this.nextButtonRef}
                      questionTabsRefs={this.questionTabsRefs}
                      questionContainerRef={this.questionContainerRef}
                      handleEvent={this.handleEvent.bind(this)}
                      getAccuracyGif={QuestionPageUtils.getAccuracyGif}
                      getCharacterName={QuestionPageUtils.getCharacterName}
                      roundScore={QuestionPageUtils.roundScore}
                      getCategoryLabel={QuestionPageUtils.getCategoryLabel}
                      getDifficultyLabel={QuestionPageUtils.getDifficultyLabel}
                      formatStartEndTime={QuestionPageUtils.formatStartEndTime}
                      formatTime={QuestionPageUtils.formatTime}
                      getTimeDuration={QuestionPageUtils.getTimeDuration}
                      onPlayAlertSound={
                        this.props.effects?.playAlertSound ??
                        this.playAlertSound.bind(this)
                      }
                      onIssueReport={(questionId) =>
                        this.setState({
                          showIssueDrawer: true,
                          targetIssueQuestionId: questionId,
                        })
                      }
                      onOpenPotterModal={
                        this.props.effects?.openPotterModalAction ??
                        this.openPotterModalAction.bind(this)
                      }
                    />
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
          <Loader
            isOpen={
              this.props.effects?.loadingPotterInit ??
              this.state.loadingPotterInit
            }
          />

          {(this.props.effects
            ? this.props.effects.loadingPotterInit === false
            : this.state.loadingPotterInit === false) && (
            <RichTextTextModalComponent
              openModal={
                this.props.effects?.openPotterModal ??
                this.state.openPotterModal
              }
              setOpenModal={
                this.props.effects?.setOpenPotterModal ??
                ((isOpen) => this.setState({ openPotterModal: isOpen }))
              }
              historyChat={
                this.props.effects?.potterHistoryChat ??
                this.state.potterHistoryChat
              }
              clickPosition={
                this.props.effects?.potterClickPosition ??
                this.state.potterClickPosition
              }
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
