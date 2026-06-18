import { NodeViewWrapper } from "@tiptap/react";
import {
  Box,
  Divider,
  InputAdornment,
  Modal,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import { getLabel } from "@/src/app/data/locale";
import React from "react";
import { Helpers } from "@/src/app/utils";
import { ImageHandler, Loader } from "../../../../elements";
import { RichTextTextModalComponent } from "../modal";
import QuestionsAPI from "../../../../../data/api/QuestionsAPI";
import { getDataHead } from "../../../../../data/head";
import { locale } from "../../../../../data/locale";
import ExerciseAnimationController from "@/app/utils/ExerciseAnimationController";

const SimpleTextField = (props) => {
  const { node, editor, updateAttributes } = props;

  const [stateValue, setStateValue] = React.useState();
  const [openModal, setOpenModal] = React.useState(false);
  const [loadingInit, setLoadingInit] = React.useState(false);
  const [historyChat, setHistoryChat] = React.useState(null);
  const [clickPosition, setClickPosition] = React.useState(null);
  const editable = editor?.view?.editable;

  // Refs for animations
  const answerFieldRef = React.useRef(null);
  const hasAnimated = React.useRef(false);

  const answer = JSON.parse(node?.attrs?.answer || "null");
  let placeholder = node?.attrs?.placeholder;

  if (
    Helpers.getCurrentLanguage() == "zh" &&
    placeholder == "Please fill your answer..."
  ) {
    placeholder = getLabel({ name: "fillTextInput" });
  }

  const label = node?.attrs?.label;
  const explanation = node?.attrs?.explanation;
  const unit = node?.attrs?.unit;
  const value = node?.attrs?.value;
  const isCorrect = node?.attrs?.isCorrect;

  const isInfo = Boolean(answer || explanation) && !editable;
  const isInfoAnswer = Boolean(answer || explanation);

  const openModalAction = async (event) => {
    // Capture click coordinates
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = rect.left + rect.width / 2; // Center of button
      const clickY = rect.top + rect.height / 2; // Center of button
      setClickPosition({ x: clickX, y: clickY });
    }

    const qid = localStorage.getItem("activeTab");
    if (historyChat === null && qid) {
      setLoadingInit(true);
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
        setHistoryChat(chatData_);
        setLoadingInit(false);
        setOpenModal(true);
      } catch (error) {
        setLoadingInit(false);
      }
    } else {
      setOpenModal(true);
    }
  };

  const handleChange = (event) => {
    const val = event?.target?.value;

    setStateValue(val);
    updateAttributes({ value: val });
  };

  React.useEffect(() => {
    setStateValue(value);
  }, [value]);

  const CorrectTextField = styled(TextField)({
    width: "65%",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#AAFF00",
        borderWidth: "4px",
      },
      "&:hover fieldset": {
        borderColor: "#AAFF00",
      },
    },
    "& .MuiInputBase-root": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#AAFF00",
      },
    },
  });

  const head = getDataHead({ name: "headQuestionPage" });

  // 3.10 - Trigger result reveal animation
  React.useEffect(() => {
    if (isInfo && answerFieldRef.current && !hasAnimated.current) {
      setTimeout(() => {
        if (isCorrect) {
          console.log("✅ Animating correct answer (TextField)");
          ExerciseAnimationController.animateCorrectAnswer(
            answerFieldRef.current,
            null,
          );
        } else if (isCorrect === false) {
          console.log("❌ Animating incorrect answer (TextField)");
          ExerciseAnimationController.animateIncorrectAnswer(
            answerFieldRef.current,
            null,
          );
        }
        hasAnimated.current = true;
      }, 200);
    }
  }, [isInfo, isCorrect]);

  return (
    <>
      <NodeViewWrapper className="rich-text-text-field-component">
        <Loader isOpen={loadingInit} />
        <Stack
          ref={answerFieldRef}
          direction={"row"}
          spacing={1}
          alignItems={"center"}
          sx={{
            marginTop: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          <Typography fontSize={16} fontWeight={400} mr={2}>
            {locale(head?.answer)}:
          </Typography>
          {isInfo && isCorrect ? (
            <CorrectTextField
              disabled={isInfo}
              label={label}
              placeholder={placeholder}
              onChange={handleChange}
              value={stateValue} //need to be parsed value isntead of stringified
              sx={{
                width: "65%",
              }}
              InputProps={
                unit && {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={"subtitle"}>{unit}</Typography>
                    </InputAdornment>
                  ),
                }
              }
            />
          ) : (
            <TextField
              disabled={isInfo}
              label={label}
              placeholder={placeholder}
              onChange={handleChange}
              value={stateValue} //need to be parsed value isntead of stringified
              sx={{
                width: "65%",
              }}
              // helperText={isInfo &&
              //   // <Stack direction={'row'} spacing={'0.5rem'} alignItems={'center'} className={'helper-text-' + (isCorrect ? 'success' : 'error')}>
              //   //   <IconCustom
              //   //     icon={isCorrect ? 'CheckCircleOutline' : 'HighlightOff'}
              //   //   />
              //   //   <Typography className="text-p">
              //   //     {getLabel({ name: (isCorrect ? 'correct' : 'wrong') })}
              //   //   </Typography>
              //   // </Stack>
              //   <></>
              // }
              error={isInfo ? !isCorrect : null}
              color={isInfo && isCorrect ? "success" : null}
              InputProps={
                unit && {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={"subtitle"}>{unit}</Typography>
                    </InputAdornment>
                  ),
                }
              }
            />
          )}
          {isInfo && (
            <Stack direction="column" alignItems="center" ml={4} gap={2}>
              <Stack
                onClick={(e) => openModalAction(e)}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ transform: "scale(1.2)" }}>
                  <ImageHandler
                    src="/purple.svg"
                    width={48}
                    height={48}
                    alt="Ask Potter"
                  />
                </Box>
              </Stack>
            </Stack>
          )}
          {/* {
            (isInfoAnswer) &&
            <IconPopover
              icon={{
                name: 'Info',
                theme: 'primary',
              }}
            >
              <Stack padding={'1rem'} spacing={1}>
                {
                  answer &&
                  <Stack spacing={1}>
                    <Typography className="text-h4">{getLabel({ name: 'correctAnswer' })}</Typography>
                    <Typography className="text-p">{answer + (unit ? ' ' + unit : '')}</Typography>
                  </Stack>
                }
                {
                  explanation &&
                  <>
                    <Divider />
                    <Stack spacing={1}>
                      <Typography className="text-h4">{getLabel({ name: 'explanation' })}</Typography>
                      <Typography className="text-p">{explanation}</Typography>
                    </Stack>
                  </>
                }
              </Stack>
            </IconPopover>
          } */}
        </Stack>

        {isInfo && (
          <Stack width="100%" mt={1}>
            {!isCorrect && answer && (
              <Stack direction="row" alignItems="center">
                <Typography fontSize={16} fontWeight={400} mr={2}>
                  {getLabel({ name: "correctAnswer" })}:
                </Typography>
                <Stack className="section-rich-text-correct-answer">
                  <Typography color="#00CDD2" fontSize={16} fontWeight={400}>
                    {answer + (unit ? " " + unit : "")}
                  </Typography>
                </Stack>
              </Stack>
            )}
            {explanation && (
              <Stack mt={1} direction="row" alignItems="center">
                <Typography fontSize={16} fontWeight={400} mr={2}>
                  {getLabel({ name: "explanation" })}:
                </Typography>
                <Stack className="section-rich-text-explanation">
                  <Typography color="#8264FF" fontSize={14} fontWeight={400}>
                    {explanation}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        )}
        {loadingInit === false && (
          <RichTextTextModalComponent
            openModal={openModal}
            setOpenModal={setOpenModal}
            historyChat={historyChat}
            clickPosition={clickPosition}
          />
        )}
      </NodeViewWrapper>
    </>
  );
};

export default SimpleTextField;
