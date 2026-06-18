"use client";
import {
  Card,
  Select,
  Stack,
  Typography,
  MenuItem,
  Modal,
  Box,
  Collapse,
  Skeleton,
} from "@mui/material";
import React, { Component, useEffect, useState } from "react";
import { Button, Loader } from "@/app/components/elements";
import { getDataHead } from "@/src/app/data/head";
import { locale } from "@/src/app/data/locale";
import { CustomDateTeacher, CustomSelect } from "../../modules";
import { RichText } from "../../sections";
import { Helpers, APIHelpers } from "@/src/app/utils";
import { QuestionsAPI } from "@/src/app/data/api";
import ClassAPI from "../../../data/api/ClassAPI";
import { TableEditor } from "../../../components/templates";

export default function QuizExercise(props) {
  const [openSelectClass, setOpenSelectClass] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modal, setModal] = useState(false);
  const [dataQuestions, setDataQuestions] = useState(null);
  const [dataQuestionsTab, setDataQuestionsTab] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [quizName, setQuizName] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [classList, setClassList] = useState([]);
  const [minimizeTable, setMinimizeTable] = useState(false);

  const head = getDataHead({ name: "headQuizExercise" });
  const headQuiz = getDataHead({ name: "headTableQuizList" });

  const mainClassName = "quiz-exercise-page";

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

  const getClassroom = async () => {
    setLoading(true);

    try {
      const res = await ClassAPI.getConfirmedClassroom(
        {
          page_number: 1,
          rows_per_page: 1000,
        },
        {},
      );
      const data = res?.payload?.data?.classrooms;
      let finalData = [];
      for (let i = 0; i < data?.length; i += 1) {
        const obj = {
          value: data[i]?.classroom_id,
          label: data[i]?.classroom_name,
        };
        finalData.push(obj);
      }
      setClassList(finalData);
    } catch (error) {}

    setLoading(false);
  };

  const createQuiz = async () => {
    setLoading(true);

    try {
      const data = [
        {
          quiz_name: quizName,
          start_date: selectedStartDate,
          end_date: selectedEndDate,
          // classroom_id: selectedClass
        },
      ];
      const res = await QuestionsAPI.createQuiz({}, { quiz_data: data });

      if (res?.payload?.status === 200) {
        setQuizName("");
        setSelectedClass(null);
        setSelectedStartDate(null);
        setSelectedEndDate(null);

        await getQuiz();

        Helpers.openSnackbar({
          variant: "success",
          message: res?.payload?.message,
          autoHideDuration: 3000,
        });
      } else {
        Helpers.openSnackbar({ message: res?.payload?.message });
      }
    } catch (error) {}

    setLoading(false);
  };

  const getQuiz = async (params) => {
    try {
      const headColumns = headQuiz?.table?.columns || {};
      const paramsPageContext = APIHelpers.refactorParamsPageContext(
        headColumns,
        params,
      );

      // let dateAscending = "asc"
      // let search = ""

      // if (paramsPageContext?.$sort === '-created_at') {
      //   dateAscending = "desc"
      // }

      // if (params?.search?.length > 0) {
      //   search = params?.search
      // }

      const refactorParams = {
        ...(paramsPageContext || {}),
        // created_at: params?.created_at ? dayjs(params?.created_at)?.format('YYYY-MM-DD') : null,
        // order: dateAscending,
        // subject: search,
      };

      const response = await QuestionsAPI.getQuiz(refactorParams);

      if (response?.success) {
        const pageContext = response.payload?.data?.page_context;
        const refactorPageContext = {
          rowCount: pageContext?.total_rows,
          page: pageContext?.page_number - 1,
          pageSize: pageContext?.rows_per_page,
          pageTotal: Math.round(
            pageContext?.total_rows / pageContext?.rows_per_page,
          ),
        };

        const refactorData = response?.payload?.data?.quizzes?.map(
          (item, index) => {
            const value = APIHelpers.refactorDatabaseToHeadTable(
              headColumns,
              item,
            );

            return {
              ...(value || {}),
              originalData: item,
            };
          },
        );

        const result = {
          pageContext: refactorPageContext,
          data: refactorData,
        };
        return result;
      }

      return {
        pageContext: ConfigComponents.Table.pageContext,
        data: [],
      };
    } catch (err) {
      return {
        pageContext: ConfigComponents.Table.pageContext,
        data: [],
      };
    }
  };

  useEffect(() => {
    getClassroom();
  }, []);

  return (
    <Stack>
      <Loader isOpen={loading} />
      <Card className={mainClassName + "-card"}>
        <Typography className={mainClassName + "-title"}>
          {locale(head?.header?.title)}
        </Typography>
        <Stack className={mainClassName + "-form-group"}>
          <Stack direction="row" className={mainClassName + "-form-row"}>
            <Stack className={mainClassName + "-form-label"}>
              <Typography className={mainClassName + "-form-text"}>
                {locale(head?.header?.form?.title)}
              </Typography>
            </Stack>
            <Stack className={mainClassName + "-form-input"}>
              <Stack
                className={mainClassName + "-form-input-select-front-wrapper"}
              >
                <Stack
                  direction="row"
                  className={mainClassName + "-form-input-select-front"}
                >
                  <Stack
                    className={
                      mainClassName + "-form-input-select-front-inner-wrapper"
                    }
                  >
                    <Stack
                      className={
                        mainClassName + "-form-input-select-front-inner"
                      }
                    >
                      <input
                        value={quizName}
                        onChange={(e) => setQuizName(e?.target?.value)}
                        className={mainClassName + "-form-input-text"}
                        placeholder={locale(head?.header?.form?.typeQuiz)}
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          <Stack pb={1} direction="row" className={mainClassName + "-form-row"}>
            <Stack className={mainClassName + "-form-label"}>
              <Typography className={mainClassName + "-form-text"}>
                {locale(head?.header?.form?.startDate)}
              </Typography>
            </Stack>
            <Stack className={mainClassName + "-form-input"}>
              <Stack width="90%">
                <CustomDateTeacher
                  selectedDate={selectedStartDate}
                  setSelectedDate={setSelectedStartDate}
                  alignContent="center"
                  placeholder={locale(head?.header?.form?.setDate)}
                />
              </Stack>
            </Stack>
          </Stack>

          <Stack pb={1} direction="row" className={mainClassName + "-form-row"}>
            <Stack className={mainClassName + "-form-label"}>
              <Typography className={mainClassName + "-form-text"}>
                {locale(head?.header?.form?.endDate)}
              </Typography>
            </Stack>
            <Stack className={mainClassName + "-form-input"}>
              <Stack width="90%">
                <CustomDateTeacher
                  selectedDate={selectedEndDate}
                  setSelectedDate={setSelectedEndDate}
                  alignContent="center"
                  placeholder={locale(head?.header?.form?.setDate)}
                />
              </Stack>
            </Stack>
          </Stack>

          {/* <Stack className={mainClassName + '-form-input-custom'}>
            <CustomSelect
              label={locale(head?.header?.form?.classroom)}
              setValue={setSelectedClass}
              setModalOpen={setOpenSelectClass}
              isOpen={openSelectClass}
              selectedValue={selectedClass}
              option={classList}
              placeholder={locale(head?.header?.form?.classroomPlaceholder)}
            />
          </Stack> */}

          <Stack className={mainClassName + "-form-btn-wrapper"}>
            <Stack onClick={createQuiz} className={mainClassName + "-form-btn"}>
              <Typography className={mainClassName + "-form-btn-txt"}>
                {locale(head?.header?.form?.create)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Card>
      <Card className={mainClassName + "-card"}>
        <Typography
          fontSize={24}
          fontWeight={600}
          color="#565656"
          textAlign="center"
        >
          {locale(head?.header?.section1?.title)}
        </Typography>

        <Stack alignItems="flex-end">
          <Stack width="fit-content" mb={minimizeTable ? 2 : -3} mt={3} mr={2}>
            <Button
              label={minimizeTable ? "V" : "X"}
              handleClick={() => setMinimizeTable(!minimizeTable)}
            />
          </Stack>
        </Stack>

        {loading ? (
          <Skeleton height={400} />
        ) : (
          <Stack>
            {!minimizeTable && (
              <TableEditor head={headQuiz} access={true} getData={getQuiz} />
            )}
          </Stack>
        )}
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleModal}>
          <Stack alignItems="flex-end" p={2}>
            <Stack
              onClick={() => setModal(false)}
              className={mainClassName + "-modal-close"}
            >
              <Typography>x</Typography>
            </Stack>
          </Stack>
          <Stack alignItems="center" pb={3} mt={-3}>
            <Typography
              fontSize={24}
              fontWeight={600}
              color="#565656"
              textAlign="center"
            >
              {locale(head?.header?.section1?.editQuestions)}
            </Typography>
            <Stack mt={1} className={mainClassName + "-modal-rich-text"}>
              <RichText value={selectedQuestion} readOnly={false} />
            </Stack>
            <Stack className={mainClassName + "-form-btn-wrapper"}>
              <Stack className={mainClassName + "-form-btn"}>
                <Typography className={mainClassName + "-form-btn-txt"}>
                  {locale(head?.header?.section1?.update)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </Stack>
  );
}
