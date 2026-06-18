import { NodeViewWrapper } from "@tiptap/react";
import { Box, Modal, Stack, Typography, IconButton } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState, useRef } from "react";
import { ImageHandler, Loader, MarkdownRenderer } from "../../../../elements";
import QuestionsAPI from "../../../../../data/api/QuestionsAPI";
import Helpers from "../../../../../utils/Helpers";
import dayjs from "dayjs";
import Auth from "../../../../../data/local/Auth";
import { getDataHead } from "../../../../../data/head";
import { locale } from "../../../../../data/locale";
import { Language } from "../../../../../data/local";
import gsap from "gsap";
import ttsManager from "../../../../../utils/TextToSpeechManager";
import Lottie from "lottie-react";
import potterWalkAnimation from "@/assets/animations/sikao.json";

const ModalComponent = (props) => {
  const { openModal, setOpenModal, historyChat } = props;

  const dataUser = Auth.getDataUser();

  const initChatData = [
    {
      type: "left",
      date: new Date(),
      msg:
        Language.getLanguage() !== "zh"
          ? `Hey ${dataUser?.name?.split(" ")?.[0]}, what can I help you with?👀`
          : `你好${dataUser?.name?.split(" ")?.[0]}, 有甚麼可以幫到你?👀`,
    },
  ];

  const [chatData, setChatData] = useState(initChatData.concat(historyChat));
  const [sendMsg, setSendMsg] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [streamingMsg, setStreamingMsg] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
  const modalRef = useRef(null);

  const styleModal = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: isAnimating
      ? "translate(-50%, -50%) scale(0.9)"
      : "translate(-50%, -50%) scale(1)",
    width: "90vw",
    maxWidth: "900px",
    maxHeight: "85vh",
    height: "auto",
    bgcolor: "#fff",
    borderRadius: "24px",
    outline: "none",
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.2)",
    zIndex: 1300,
    opacity: isAnimating ? 0 : 1,
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const getBubleColor = (param) => {
    const colors = ["#EDE9FE", "#CCF5F6", "#FFE9CC", "#FFE0EC"];
    const index = (param - 1) % colors.length;
    return colors[index];
  };

  const getLatestAssistantResponse = (data) => {
    return data?.assistant_response || "";
  };

  const sendChat = async (paramMsg) => {
    setLoadingMsg(true);

    let msgData = sendMsg;

    if (paramMsg) {
      msgData = paramMsg;
    }

    setChatData((prevChatData) => [
      ...prevChatData,
      {
        type: "right",
        date: new Date(),
        msg: msgData,
      },
    ]);

    try {
      const qid = localStorage.getItem("activeTab");

      const currentLang = Helpers.getCurrentLanguage();
      const data = {
        question_id: parseInt(qid),
        question: msgData,
        region: currentLang === "zh" ? "zh" : "en",
      };

      const res = await QuestionsAPI.chatGetStream({}, data);
      const resMsg = getLatestAssistantResponse(res?.payload?.data);

      const words = resMsg?.split(" ");
      let currentMsg = "";

      setChatData((prevChatData) => [
        ...prevChatData,
        {
          type: "left",
          date: new Date(),
          msg: currentMsg,
        },
      ]);

      // Start streaming
      setLoadingMsg(false);
      setStreamingMsg(true);

      words.forEach((word, index) => {
        setTimeout(() => {
          currentMsg += (index === 0 ? "" : " ") + word;
          setChatData((prevChatData) => {
            const newChatData = [...prevChatData];

            newChatData[newChatData.length - 1] = {
              ...newChatData[newChatData.length - 1],
              msg: currentMsg,
            };
            return newChatData;
          });

          // End streaming after the last word
          if (index === words.length - 1) {
            setStreamingMsg(false);
          }
        }, index * 100);
      });

      setSendMsg("");
    } catch (error) {
      Helpers.openSnackbar({ message: error });

      setLoadingMsg(false);
      setStreamingMsg(false);
    }
  };

  const chatWrapperRef = useRef(null);

  const scrollToBottom = () => {
    if (chatWrapperRef.current) {
      chatWrapperRef.current.scrollTop = chatWrapperRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatData]);

  // Handle modal animation when it opens
  useEffect(() => {
    if (openModal) {
      // Start animation
      setIsAnimating(true);

      // Animate in after a brief delay
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }

    // Stop TTS when modal closes
    if (!openModal && ttsManager.isSupported()) {
      ttsManager.stop();
      setSpeakingMessageIndex(null);
      setIsAnimating(true);
    }
  }, [openModal]);

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !loadingMsg &&
      !streamingMsg &&
      sendMsg.trim() !== ""
    ) {
      e.preventDefault();
      sendChat();
    }
  };

  // Handle TTS for specific message
  const handleSpeakMessage = (e, messageIndex, messageText) => {
    e.stopPropagation();

    if (!ttsManager.isSupported()) {
      return;
    }

    // If this message is already speaking, stop it
    if (speakingMessageIndex === messageIndex && ttsManager.isSpeaking()) {
      ttsManager.stop();
      setSpeakingMessageIndex(null);
      return;
    }

    // Stop any currently playing audio
    ttsManager.stop();

    // Clean up text - remove markdown syntax and emojis
    let cleanText = messageText || "";

    // 1. Map Math Symbols (LaTeX & Raw)
    const mathMap = {
      "\\\\times": " times ",
      "\\\\div": " divided by ",
      "\\\\pm": " plus or minus ",
      "\\\\leq": " is less than or equal to ",
      "\\\\geq": " is greater than or equal to ",
      "\\\\neq": " is not equal to ",
      "\\\\approx": " is approximately ",
      "\\\\degree": " degrees ",
      "\\\\angle": " angle ",
      "\\\\parallel": " is parallel to ",
      "\\\\perp": " is perpendicular to ",
      "×": " times ",
      "÷": " divided by ",
      "=": " equals ",
      "\\+": " plus ",
      "-": " minus ",
    };

    // Replace known math symbols
    Object.entries(mathMap).forEach(([key, value]) => {
      // Use global regex
      cleanText = cleanText.replace(new RegExp(key, "g"), value);
    });

    // 2. Handle Fractions (Simple LaTeX \frac{a}{b})
    cleanText = cleanText.replace(
      /\\frac\{([^}]*)\}\{([^}]*)\}/g,
      "$1 over $2",
    );

    // 3. Handle Blanks (Underscores)
    cleanText = cleanText.replace(/_+/g, " blank ");

    // 4. Remove Markdown Formatting
    // Bold/Italic (**text**, *text*, __text__, _text_)
    cleanText = cleanText.replace(/(\*\*|__)(.*?)\1/g, "$2");
    cleanText = cleanText.replace(/(\*|_)(.*?)\1/g, "$2");

    // Links [text](url) -> text
    cleanText = cleanText.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");

    // Code blocks `text` -> text
    cleanText = cleanText.replace(/`([^`]+)`/g, "$1");

    // 5. Remove Emojis and Special Chars
    cleanText = cleanText.replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu,
      "",
    );

    // Remove remaining backslashes/braces from simple LaTeX
    cleanText = cleanText.replace(/[\\{}]/g, " ");

    cleanText = cleanText.trim();

    if (!cleanText) {
      return;
    }

    // Set up state change callback
    ttsManager.setStateChangeCallback(({ speaking }) => {
      if (speaking) {
        setSpeakingMessageIndex(messageIndex);
      } else {
        setSpeakingMessageIndex(null);
      }
    });

    // Start speaking
    ttsManager.speak(cleanText);
    setSpeakingMessageIndex(messageIndex);
  };

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if (ttsManager.isSupported()) {
        ttsManager.stop();
      }
    };
  }, []);

  const head = getDataHead({ name: "headQuizReport" });

  const templateResponse = [
    locale(head?.potter?.hints),
    locale(head?.potter?.explain),
  ];

  return (
    <>
      <NodeViewWrapper className="rich-text-text-field-component">
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          disableEnforceFocus
          hideBackdrop
          style={{ pointerEvents: "none" }}
        >
          <Box ref={modalRef} sx={styleModal} style={{ pointerEvents: "auto" }}>
            {/* Header */}
            <Stack
              sx={{
                background: "linear-gradient(135deg, #8264ff 0%, #a084ff 100%)",
                borderRadius: "24px 24px 0 0",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    "& > *": {
                      width: "135% !important",
                      height: "135% !important",
                      minWidth: "135% !important",
                      minHeight: "135% !important",
                      maxWidth: "none !important",
                      maxHeight: "none !important",
                      transform: "translate(-10%, -10%) !important",
                    },
                    "& svg": {
                      width: "135% !important",
                      height: "135% !important",
                      transform: "translate(-10%, -10%) !important",
                    },
                  }}
                >
                  <Lottie
                    animationData={potterWalkAnimation}
                    loop={true}
                    style={{
                      width: "135%",
                      height: "135%",
                      minWidth: "135%",
                      minHeight: "135%",
                      transform: "translate(-10%, -10%)",
                    }}
                  />
                </Box>
                <Stack>
                  <Typography
                    color="#fff"
                    fontWeight={700}
                    fontSize="20px"
                    sx={{
                      textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    Potter AI
                  </Typography>
                  {loadingMsg && (
                    <Typography
                      color="rgba(255, 255, 255, 0.9)"
                      fontWeight={400}
                      fontSize="14px"
                      sx={{ mt: 0.5 }}
                    >
                      Thinking...
                    </Typography>
                  )}
                </Stack>
              </Stack>
              <IconButton
                onClick={() => setOpenModal(false)}
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
            {/* Chat Area */}
            <Stack
              ref={chatWrapperRef}
              sx={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                backgroundColor: "#f8f9fa",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#c1c1c1",
                  borderRadius: "10px",
                  "&:hover": {
                    background: "#a8a8a8",
                  },
                },
              }}
            >
              {chatData?.map((val, i) => (
                <div key={i}>
                  {val?.type === "left" ? (
                    <Stack
                      mb={3}
                      direction="row"
                      alignItems="flex-end"
                      spacing={2}
                    >
                      <Box
                        sx={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          backgroundColor: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          flexShrink: 0,
                          mb: "20px",
                          "& > *": {
                            width: "135% !important",
                            height: "135% !important",
                            minWidth: "135% !important",
                            minHeight: "135% !important",
                            maxWidth: "none !important",
                            maxHeight: "none !important",
                            transform: "translate(-10%, -10%) !important",
                          },
                          "& svg": {
                            width: "135% !important",
                            height: "135% !important",
                            transform: "translate(-10%, -10%) !important",
                          },
                        }}
                      >
                        <Lottie
                          animationData={potterWalkAnimation}
                          loop={true}
                          style={{
                            width: "135%",
                            height: "135%",
                            minWidth: "135%",
                            minHeight: "135%",
                            transform: "translate(-10%, -10%)",
                          }}
                        />
                      </Box>
                      <Stack flex={1}>
                        <Typography
                          color="#8B8B8C"
                          fontSize="12px"
                          fontWeight={400}
                          sx={{ mb: 0.5 }}
                        >
                          {dayjs(val?.date).format("DD/MM/YYYY, HH:mm")}
                        </Typography>
                        <Stack
                          direction="row"
                          alignItems="flex-start"
                          gap={1}
                          spacing={1}
                        >
                          <Stack
                            sx={{
                              backgroundColor: getBubleColor(i + 1),
                              borderRadius: "20px",
                              padding: "14px 18px",
                              border: "2px solid rgba(130, 100, 255, 0.3)",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              maxWidth: "75%",
                              position: "relative",
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                left: "-12px",
                                bottom: "20px",
                                width: 0,
                                height: 0,
                                borderStyle: "solid",
                                borderWidth: "10px 12px 10px 0",
                                borderColor: `transparent ${getBubleColor(i + 1)} transparent transparent`,
                              },
                              "&::after": {
                                content: '""',
                                position: "absolute",
                                left: "-14px",
                                bottom: "18px",
                                width: 0,
                                height: 0,
                                borderStyle: "solid",
                                borderWidth: "12px 14px 12px 0",
                                borderColor:
                                  "transparent rgba(130, 100, 255, 0.3) transparent transparent",
                              },
                            }}
                          >
                            <MarkdownRenderer className="section-rich-text-modal-chat-txt">
                              {val?.msg}
                            </MarkdownRenderer>
                          </Stack>
                          {ttsManager.isSupported() && (
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleSpeakMessage(e, i, val?.msg)
                              }
                              sx={{
                                padding: "6px",
                                minWidth: "32px",
                                width: "32px",
                                height: "32px",
                                color:
                                  speakingMessageIndex === i
                                    ? "#8264ff"
                                    : "#8B8B8C",
                                backgroundColor:
                                  speakingMessageIndex === i
                                    ? "rgba(130, 100, 255, 0.1)"
                                    : "transparent",
                                opacity: speakingMessageIndex === i ? 1 : 0.7,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  opacity: 1,
                                  transform: "scale(1.1)",
                                  backgroundColor: "rgba(130, 100, 255, 0.15)",
                                },
                              }}
                            >
                              {speakingMessageIndex === i ? (
                                <VolumeUpIcon sx={{ fontSize: "20px" }} />
                              ) : (
                                <VolumeOffIcon sx={{ fontSize: "20px" }} />
                              )}
                            </IconButton>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack mb={3} alignItems="flex-end">
                      <Typography
                        color="#8B8B8C"
                        fontSize="12px"
                        fontWeight={400}
                        sx={{ mb: 0.5 }}
                      >
                        {dayjs(val?.date).format("DD/MM/YYYY, HH:mm")}
                      </Typography>
                      <Stack
                        sx={{
                          backgroundColor: "#8264ff",
                          color: "#fff",
                          borderRadius: "20px",
                          padding: "14px 18px",
                          border: "2px solid rgba(130, 100, 255, 0.5)",
                          boxShadow: "0 4px 12px rgba(130, 100, 255, 0.25)",
                          maxWidth: "75%",
                          "& .section-rich-text-modal-chat-txt": {
                            color: "#fff !important",
                            "& *": {
                              color: "#fff !important",
                            },
                          },
                        }}
                      >
                        <MarkdownRenderer className="section-rich-text-modal-chat-txt">
                          {val?.msg}
                        </MarkdownRenderer>
                      </Stack>
                    </Stack>
                  )}
                </div>
              ))}
            </Stack>
            {loadingMsg && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ padding: "16px 24px", backgroundColor: "#f8f9fa" }}
              >
                <Box
                  sx={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Lottie
                    animationData={potterWalkAnimation}
                    loop={true}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
                <Typography color="#8B8B8C" fontSize="14px">
                  Potter is thinking...
                </Typography>
              </Stack>
            )}
            {/* Template Responses */}
            <Stack
              sx={{
                padding: "16px 24px",
                backgroundColor: "#f8f9fa",
                borderTop: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            >
              <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
                {templateResponse?.map((val, i) => {
                  const isDisabled = loadingMsg || streamingMsg;
                  return (
                    <Stack
                      onClick={() => {
                        if (!isDisabled) {
                          sendChat(val);
                        }
                      }}
                      key={i}
                      sx={{
                        padding: "10px 16px",
                        backgroundColor: isDisabled ? "#f5f5f5" : "#fff",
                        borderRadius: "16px",
                        border: "2px solid rgba(130, 100, 255, 0.2)",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled ? 0.6 : 1,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: isDisabled ? "#f5f5f5" : "#f0f0ff",
                          borderColor: isDisabled
                            ? "rgba(130, 100, 255, 0.2)"
                            : "rgba(130, 100, 255, 0.4)",
                          transform: isDisabled ? "none" : "translateY(-2px)",
                          boxShadow: isDisabled
                            ? "none"
                            : "0 4px 8px rgba(130, 100, 255, 0.15)",
                        },
                      }}
                    >
                      <Typography
                        fontSize="14px"
                        fontWeight={500}
                        color="#8264ff"
                      >
                        {val}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Stack>
            {/* Input Area */}
            <Stack
              sx={{
                padding: "20px 24px",
                backgroundColor: "#fff",
                borderTop: "1px solid rgba(0, 0, 0, 0.05)",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
              }}
            >
              <input
                value={loadingMsg || streamingMsg ? "" : sendMsg}
                onChange={(e) => {
                  if (!loadingMsg && !streamingMsg) {
                    setSendMsg(e?.target?.value);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type something..."
                disabled={loadingMsg || streamingMsg}
                style={{
                  flex: 1,
                  border: "2px solid rgba(130, 100, 255, 0.2)",
                  borderRadius: "20px",
                  padding: "12px 18px",
                  fontSize: "15px",
                  outline: "none",
                  transition: "all 0.2s ease",
                  opacity: loadingMsg || streamingMsg ? 0.6 : 1,
                  cursor: loadingMsg || streamingMsg ? "not-allowed" : "text",
                  backgroundColor:
                    loadingMsg || streamingMsg ? "#f5f5f5" : "#fff",
                }}
                onFocus={(e) => {
                  if (!loadingMsg && !streamingMsg) {
                    e.target.style.borderColor = "rgba(130, 100, 255, 0.5)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(130, 100, 255, 0.2)";
                }}
              />
              <IconButton
                onClick={() => sendChat()}
                disabled={loadingMsg || streamingMsg || !sendMsg.trim()}
                sx={{
                  backgroundColor: "#8264ff",
                  color: "#fff",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  "&:hover": {
                    backgroundColor: "#6d4edb",
                  },
                  "&:disabled": {
                    backgroundColor: "#ccc",
                    color: "#999",
                  },
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                    fill="currentColor"
                  />
                </svg>
              </IconButton>
            </Stack>
          </Box>
        </Modal>
      </NodeViewWrapper>
    </>
  );
};

export default ModalComponent;
