"use client";

import React, { Component } from "react";
import { TableEditor } from "@/app/components/templates";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import { TeacherCard } from "@/app/components/modules";
import { getDataHead } from "@/app/data/head";
import { APIHelpers } from "@/app/utils";
import QuestionsAPI from "@/app/data/api/QuestionsAPI";
import { ConfigComponents } from "@/app/constant";
import { Helpers } from "@/app/utils";
import dayjs from "dayjs";

class UserQuestionsTeacher extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getQuestion = async (params) => {
    try {
      const headColumns = this.state.head?.table?.columns || {};
      const paramsPageContext = APIHelpers.refactorParamsPageContext(
        headColumns,
        params,
      );
      let dateAscending = "asc";
      let search = "";
      if (paramsPageContext?.$sort === "-created_at") dateAscending = "desc";
      if (params?.search?.length > 0) search = params?.search;
      const refactorParams = {
        ...(paramsPageContext || {}),
        created_at: params?.created_at
          ? dayjs(params?.created_at)?.format("YYYY-MM-DD")
          : null,
        order: dateAscending,
        subject: search,
      };
      const response = await QuestionsAPI.getUserQuestions(refactorParams);
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
        const refactorData = response?.payload?.data?.userQuestions?.map(
          (item) => {
            const value = APIHelpers.refactorDatabaseToHeadTable(
              headColumns,
              item,
            );
            return {
              ...(value || {}),
              creator: item?.user?.first_name + " " + item?.user?.last_name,
              originalData: item,
            };
          },
        );
        return { pageContext: refactorPageContext, data: refactorData };
      }
      return { pageContext: ConfigComponents.Table.pageContext, data: [] };
    } catch (err) {
      return { pageContext: ConfigComponents.Table.pageContext, data: [] };
    }
  };

  assignHead = async () => {
    try {
      const head = getDataHead({ name: "headTableEditorQuestions" });
      this.setState({ head, access: { add: true, checkbox: true } });
    } catch (err) {}
  };

  deleteAction = async (params) => {
    const { arrId } = params;
    this.props.assignMainLayout?.({ type: "ASSIGN_OPEN_LOADER" });
    try {
      const res = await QuestionsAPI.deleteUserQuestion(
        {},
        { question_ids: arrId },
      );
      if (res?.payload?.status === 200) {
        Helpers.openSnackbar({
          variant: "success",
          message: res?.payload?.message,
          autoHideDuration: 3000,
        });
      } else {
        Helpers.openSnackbar({ message: res?.message });
      }
      return res;
    } catch (error) {}
    this.props.assignMainLayout?.({ type: "ASSIGN_CLOSE_LOADER" });
  };

  componentDidMount() {
    this.props.assignMainLayout?.({ type: "ASSIGN_OPEN_LOADER" });
    this.assignHead();
    this.props.assignMainLayout?.({ type: "ASSIGN_CLOSE_LOADER" });
  }

  render() {
    const { head, access } = this.state;
    return (
      <ContentLayout>
        <TeacherCard>
          <TableEditor
            head={head}
            access={access}
            getData={this.getQuestion}
            deleteAction={this.deleteAction}
          />
        </TeacherCard>
      </ContentLayout>
    );
  }
}

export default UserQuestionsTeacher;
