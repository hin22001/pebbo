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
import { Helpers, APIHelpers } from "@/src/app/utils";
import { QuestionsAPI } from "@/src/app/data/api";
import ClassAPI from "../../../data/api/ClassAPI";
import { TableEditor } from "../../../components/templates";

export default function ClassroomAddQuiz(props) {
  const [loading, setLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState([[]]);
  const [modalOpen, setModalOpen] = useState(false);

  const head = getDataHead({ name: "headQuizExercise" });
  const headQuizList = getDataHead({
    name:
      props?.type === "list"
        ? "headTableQuizClassListStudent"
        : "headTableQuizClassList",
  });
  const headQuizAdd = getDataHead({ name: "headTableQuizAddClass" });

  const url = window.location.search;
  const paramsUrl = new URLSearchParams(url);
  const classroom_id = paramsUrl.get("id");

  const mainClassName = "quiz-exercise-page";

  const addQuizClassroom = async (params) => {
    setLoading(true);

    try {
      const quizIds = params?.dataList?.filter(
        (id) => !selectedQuiz.includes(id),
      );
      const res = await ClassAPI.addQuizClassroom(
        {},
        {
          classroom_id: parseInt(classroom_id),
          quiz_ids: quizIds,
        },
      );

      if (res?.payload?.status === 200) {
        Helpers.openSnackbar({
          variant: "success",
          message: res?.payload?.message,
          autoHideDuration: 3000,
        });
        setModalOpen(false);
        getQuizClass();
      } else {
        Helpers.openSnackbar({ message: res?.payload?.message });
      }
    } catch (error) {}

    setLoading(false);
  };

  const getQuiz = async (params) => {
    try {
      const headColumns = headQuizAdd?.table?.columns || {};
      const paramsPageContext = APIHelpers.refactorParamsPageContext(
        headColumns,
        params,
      );

      // let dateAscending = "asc"
      let search = "";

      // if (paramsPageContext?.$sort === '-created_at') {
      //   dateAscending = "desc"
      // }

      if (params?.search?.length > 0) {
        search = params?.search;
      }

      const refactorParams = {
        ...(paramsPageContext || {}),
        // created_at: params?.created_at ? dayjs(params?.created_at)?.format('YYYY-MM-DD') : null,
        // order: dateAscending,
        quiz_name: search,
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
              mutable: !selectedQuiz?.some((val) => val === item?.id),
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

  const getQuizList = async (params) => {
    try {
      const headColumns = headQuizList?.table?.columns || {};
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
        classroom_id,
        order: "asc",
        // created_at: params?.created_at ? dayjs(params?.created_at)?.format('YYYY-MM-DD') : null,
        // order: dateAscending,
        // subject: search,
      };

      const response = await ClassAPI.getQuizClassroom(refactorParams);

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

        const refactorData = response?.payload?.data?.classroomQuizzes?.map(
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

  const getQuizClass = async () => {
    setLoading(true);

    try {
      const res = await ClassAPI.getQuizClassroom(
        {
          page_number: 1,
          rows_per_page: 100,
          classroom_id: classroom_id,
          order: "asc",
        },
        {},
      );

      const data = res?.payload?.data?.classroomQuizzes?.map(
        (val) => val.quiz_id,
      );
      setSelectedQuiz(data);
    } catch (error) {}

    setLoading(false);
  };

  useEffect(() => {
    getQuizClass();
  }, []);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Stack>
      <Loader isOpen={loading} />
      <Card className={mainClassName + "-card"}>
        <Typography
          fontSize={24}
          fontWeight={600}
          color="#565656"
          textAlign="center"
        >
          {locale(head?.classroom?.title)}
        </Typography>
        {props?.type !== "list" && (
          <Stack alignItems="flex-end">
            <Stack pr={2} mb={-2} mt={4} width="fit-content">
              <Button
                label={locale(head?.classroom?.btn)}
                handleClick={() => setModalOpen(true)}
              />
            </Stack>
          </Stack>
        )}
        {loading ? (
          <Skeleton height={400} />
        ) : (
          <Stack>
            <TableEditor
              head={headQuizList}
              access={true}
              getData={getQuizList}
            />
          </Stack>
        )}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          aria-labelledby="keep-mounted-modal-title"
          aria-describedby="keep-mounted-modal-description"
        >
          <Box sx={style}>
            <TableEditor
              head={headQuizAdd}
              access={{ checkbox: true, data: [] }}
              getData={getQuiz}
              onSave={addQuizClassroom}
            />
          </Box>
        </Modal>
      </Card>
    </Stack>
  );
}
