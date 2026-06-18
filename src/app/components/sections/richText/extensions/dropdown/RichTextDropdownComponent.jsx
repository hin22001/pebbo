import { NodeViewWrapper } from "@tiptap/react";
import {
  Chip,
  Dropdown,
  DropdownInput,
  IconCustom,
  IconPopover,
} from "@/components/elements";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { getLabel } from "@/src/app/data/locale";
import React from "react";
import { Helpers } from "@/src/app/utils";
import { RichTextTextModalComponent } from "../modal";
import QuestionsAPI from "../../../../../data/api/QuestionsAPI";
import { ImageHandler, Loader } from "../../../../elements";
import { getDataHead } from "../../../../../data/head";
import { locale } from "../../../../../data/locale";
import ExerciseAnimationController from "@/app/utils/ExerciseAnimationController";

const SimpleDropdown = (props) => {
  const { node, editor, updateAttributes } = props;

  // ============================================================
  // =================== INITIALIZE STATE =======================
  // ============================================================

  const [stateValue, setStateValue] = React.useState();
  const [openModal, setOpenModal] = React.useState(false);
  const [loadingInit, setLoadingInit] = React.useState(false);
  const [historyChat, setHistoryChat] = React.useState(null);
  const [clickPosition, setClickPosition] = React.useState(null);

  // Refs for animations
  const answerFieldRef = React.useRef(null);
  const hasAnimated = React.useRef(false);

  // ============================================================
  // ================ INITIALIZE VARIABLE =======================
  // ============================================================

  const editable = editor?.view?.editable;
  const options = JSON.parse(node?.attrs?.options || "[]");
  const answers = JSON.parse(node?.attrs?.answers || "[]");
  let placeholder = node?.attrs?.placeholder;

  if (Helpers.getCurrentLanguage() == "zh" && placeholder == "Select") {
    placeholder = getLabel({ name: "select" });
  }

  const label = node?.attrs?.label;
  const explanation = node?.attrs?.explanation;
  const unit = node?.attrs?.unit;
  const multiple = node?.attrs?.multiple;
  const value = node?.attrs?.value;
  const isCorrect = node?.attrs?.isCorrect;

  // Only show checked answers as correct (filter out unchecked options)
  const checkedAnswers =
    answers?.filter(
      (item) => item.checked === true || item.checked === undefined,
    ) || [];

  const answerString =
    checkedAnswers?.length > 0 &&
    checkedAnswers
      ?.flatMap((item) => item.label + (unit ? " " + unit : ""))
      .join(", ");

  const isInfo =
    Boolean(checkedAnswers?.length > 0 || explanation) && !editable;
  const isInfoAnswer = Boolean(checkedAnswers?.length > 0 || explanation);

  // ============================================================
  // ========================= HANDLER ==========================
  // ============================================================

  const handleChange = (paramValue) => {
    try {
      const val = Array.isArray(paramValue)
        ? paramValue?.flatMap((item) => item.id)
        : paramValue?.id;

      setStateValue(val);
      updateAttributes({ value: paramValue });
    } catch (err) {}
  };

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

  React.useEffect(() => {
    if (value) {
      const val = Array.isArray(value)
        ? value?.flatMap((item) => item.id)
        : value?.id;

      setStateValue(val);
    }
  }, [value]);

  const head = getDataHead({ name: "headQuestionPage" });

  // 3.10 - Trigger result reveal animation
  React.useEffect(() => {
    if (isInfoAnswer && answerFieldRef.current && !hasAnimated.current) {
      setTimeout(() => {
        if (isCorrect) {
          console.log("✅ Animating correct answer (Dropdown)");
          ExerciseAnimationController.animateCorrectAnswer(
            answerFieldRef.current,
            null,
          );
        } else if (isCorrect === false) {
          console.log("❌ Animating incorrect answer (Dropdown)");
          ExerciseAnimationController.animateIncorrectAnswer(
            answerFieldRef.current,
            null,
          );
        }
        hasAnimated.current = true;
      }, 200);
    }
  }, [isInfoAnswer, isCorrect]);

  return (
    <NodeViewWrapper className="rich-text-dropdown-component">
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
        <DropdownInput
          disabled={isInfo}
          data={options}
          label={label}
          placeholder={placeholder}
          onChange={handleChange}
          displayEmpty={false}
          sx={{
            width: "65%",
          }}
          value={stateValue}
          multiple={multiple}
          // helperText={isInfo &&
          //   <Stack direction={'row'} spacing={'0.5rem'} alignItems={'center'} className={'helper-text-' + (isCorrect ? 'success' : 'error')}>
          //     <IconCustom
          //       icon={isCorrect ? 'CheckCircleOutline' : 'HighlightOff'}
          //     />
          //     <Typography className="text-p">
          //       {getLabel({ name: (isCorrect ? 'correct' : 'wrong') })}
          //     </Typography>
          //   </Stack>
          // }
          error={isInfo ? !isCorrect : null}
          correctDropdown={isInfo && isCorrect}
        />
        {isInfoAnswer && (
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
                answers &&
                <Stack spacing={1}>
                  <Typography className="text-h4">{getLabel({ name: 'correctAnswer' })}</Typography>
                  <Typography className="text-p">{answerString}</Typography>
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

      {isInfoAnswer && (
        <Stack width="100%" mt={1}>
          {!isCorrect && answerString && (
            <Stack direction="row" alignItems="center">
              <Typography fontSize={16} fontWeight={400} mr={2}>
                {getLabel({ name: "correctAnswer" })}:
              </Typography>
              <Stack className="section-rich-text-correct-answer">
                <Typography color="#00CDD2" fontSize={16} fontWeight={400}>
                  {answerString}
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
  );
};

export default SimpleDropdown;
