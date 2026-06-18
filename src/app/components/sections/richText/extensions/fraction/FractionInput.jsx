import { IconCustom, IconPopover } from "@/components/elements";
import { Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { getLabel } from "@/src/app/data/locale";
import { useState, useEffect, useRef } from "react";
import katex from "katex";
import Paragraph from "@tiptap/extension-paragraph";
import StarterKit from "@tiptap/starter-kit";
import { useEditor, EditorContent } from "@tiptap/react";
import {
  RichTextDropdown,
  RichTextKatex,
  RichTextSegment,
  RichTextSVG,
  RichTextTextField,
  RichTextFractionField,
  RichTextTextModalComponent,
} from "../../extensions";
import QuestionsAPI from "../../../../../data/api/QuestionsAPI";
import { ImageHandler, Loader } from "../../../../elements";
import { getDataHead } from "../../../../../data/head";
import { locale } from "../../../../../data/locale";
import ExerciseAnimationController from "@/app/utils/ExerciseAnimationController";

const FractionInput = (props) => {
  // const [fractionArr, setFractionArr] = useState([{id: 0, wholeNumber: null, numerator: null, denominator: null}])

  const {
    node,
    getResult,
    fractionArr,
    setFractionArr,
    answer,
    explanation,
    isInfo,
    isCorrect,
    isEditor,
  } = props;

  const [openModal, setOpenModal] = useState(false);
  const [loadingInit, setLoadingInit] = useState(false);
  const [historyChat, setHistoryChat] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);

  // Refs for animations
  const answerFieldRef = useRef(null);
  const hasAnimated = useRef(false);

  const onChangeFract = (e, id, type) => {
    const value = e?.target?.value;
    let res = null;

    switch (type) {
      case "wholeNumber":
        res = fractionArr.map((item) => {
          if (item.id === id) {
            return { ...item, wholeNumber: value };
          }
          return item;
        });
        break;
      case "numerator":
        res = fractionArr.map((item) => {
          if (item.id === id) {
            return { ...item, numerator: value };
          }
          return item;
        });
        break;
      case "denominator":
        res = fractionArr.map((item) => {
          if (item.id === id) {
            return { ...item, denominator: value };
          }
          return item;
        });
        break;
    }
    setFractionArr(res);

    let resFrac = "";
    for (let i = 0; i < res?.length; i += 1) {
      if (
        res[i]?.wholeNumber?.length > 0 ||
        res[i]?.numerator?.length > 0 ||
        res[i]?.denominator?.length > 0
      ) {
        const string = `${res[i]?.wholeNumber}\\frac{${res[i]?.numerator}}{${res[i]?.denominator}}`;
        resFrac = resFrac + string;
      }
    }

    getResult(resFrac);
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

  const editorExp = useEditor({
    editable: false,
    extensions: [
      Paragraph,
      StarterKit,
      RichTextDropdown,
      RichTextKatex,
      RichTextSegment,
      RichTextSVG,
      RichTextTextField,
      RichTextFractionField,
    ],
    content: explanation ? JSON.parse(explanation) : null,
    editorProps: {
      attributes: {
        spellcheck: "false",
      },
    },
  });

  const head = getDataHead({ name: "headQuestionPage" });

  // 3.10 - Trigger result reveal animation
  useEffect(() => {
    if (isInfo && answerFieldRef.current && !hasAnimated.current) {
      setTimeout(() => {
        if (isCorrect) {
          console.log("✅ Animating correct answer (Fraction)");
          ExerciseAnimationController.animateCorrectAnswer(
            answerFieldRef.current,
            null
          );
        } else if (isCorrect === false) {
          console.log("❌ Animating incorrect answer (Fraction)");
          ExerciseAnimationController.animateIncorrectAnswer(
            answerFieldRef.current,
            null
          );
        }
        hasAnimated.current = true;
      }, 200);
    }
  }, [isInfo, isCorrect]);

  return (
    <Stack>
      <Loader isOpen={loadingInit} />
      <Stack
        ref={answerFieldRef}
        className="fraction-input-container"
        spacing={1}
        direction="row"
        alignItems={"center"}
      >
        <Typography fontSize={16} fontWeight={400} mr={2}>
          {locale(head?.answer)}:
        </Typography>
        {fractionArr?.map((val, i) => (
          <>
            <TextField
              disabled={isInfo && !isEditor}
              type="text"
              className="fraction-whole-number"
              value={val.wholeNumber}
              onChange={(e) => onChangeFract(e, val.id, "wholeNumber")}
              height="100%"
              error={isEditor ? null : isInfo ? !isCorrect : null}
              color={isEditor ? null : isInfo && isCorrect ? "success" : null}
            />
            <Stack className="fraction" spacing={1}>
              <TextField
                disabled={isInfo && !isEditor}
                type="text"
                className="fraction-numerator"
                value={val.numerator}
                onChange={(e) => onChangeFract(e, val.id, "numerator")}
                error={isEditor ? null : isInfo ? !isCorrect : null}
                color={isEditor ? null : isInfo && isCorrect ? "success" : null}
              />
              <Divider />
              <TextField
                disabled={isInfo && !isEditor}
                type="text"
                className="fraction-denominator"
                value={val.denominator}
                onChange={(e) => onChangeFract(e, val.id, "denominator")}
                error={isEditor ? null : isInfo ? !isCorrect : null}
                color={isEditor ? null : isInfo && isCorrect ? "success" : null}
                helperText={
                  !isEditor &&
                  isInfo && (
                    <Stack
                      direction={"row"}
                      spacing={"0.5rem"}
                      justifyContent={"flex-end"}
                      alignItems={"center"}
                      className={
                        "helper-text-" + (isCorrect ? "success" : "error")
                      }
                    >
                      <IconCustom
                        icon={isCorrect ? "CheckCircleOutline" : "HighlightOff"}
                      />
                      <Typography className="text-p">
                        {getLabel({ name: isCorrect ? "correct" : "wrong" })}
                      </Typography>
                    </Stack>
                  )
                }
              />
            </Stack>
          </>
        ))}
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
              <ImageHandler
                src={require("@/images/icon/icon-new-question.svg")}
                width={32}
                height={32}
                alt="Ask Potter"
              />
            </Stack>
          </Stack>
        )}
        {/* {
            (isInfo) &&
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
                    <span dangerouslySetInnerHTML={{ __html: Katexing(answer) }} />
                  </Stack>
                }
                {
                  explanation &&
                  <>
                    <Divider />
                    <Stack spacing={1}>
                      <Typography className="text-h4">{getLabel({ name: 'explanation' })}</Typography>
                      <EditorContent
                        editor={editorExp}
                        className={'section-rich-text-editor'}
                        editorContentRef={(val) => {
                        }}
                      />
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
                  <span
                    dangerouslySetInnerHTML={{ __html: Katexing(answer) }}
                  />
                </Typography>
              </Stack>
            </Stack>
          )}
          {explanation && (
            <Stack mt={1}>
              <Typography fontSize={16} fontWeight={400}>
                {getLabel({ name: "explanation" })}:
              </Typography>
              <EditorContent
                editor={editorExp}
                className={"section-rich-text-editor"}
                editorContentRef={(val) => {}}
              />
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
    </Stack>
  );
};

function Katexing(string) {
  var htmlString = katex.renderToString(string?.toString() || "", {
    throwOnError: false,
  });
  return htmlString;
}

export default FractionInput;
