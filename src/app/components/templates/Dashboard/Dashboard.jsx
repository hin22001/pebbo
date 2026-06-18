import React, { Component } from "react";
import { getDataHead } from "@/src/app/data/head";
import { Stack } from "@mui/material";
import AdminCard from "@/modules/card/AdminCard";
import NoticeCard from "@/modules/card/NoticeCard";
import StudentCard from "@/modules/card/StudentCard";
import TeacherCard from "@/modules/card/TeacherCard";
import { Auth } from "@/src/app/data/local";
import { locale } from "@/src/app/data/locale";
import { ContentLayout } from "@/layouts/ContentLayout";
import { withAppRouter } from "@/app/utils/withAppRouter";
import { ClassRoom, StudentDashboard } from ".";
import { AdminManagement } from "../AdminManagement";
import LoginAPI from "../../../data/api/LoginAPI";
import Loader from "@/elements/loader/Loader";

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-class-name",
      loader: false,
    };

    this.attemptSubscribe = this.attemptSubscribe.bind(this);
  }

  async handleEvent(params) {
    try {
      switch (params?.type) {
        case "event":
          {
          }
          break;
      }
    } catch (err) {}
  }

  async initialize() {
    try {
      const isAuthenticated = Auth.getDataUser() != null;

      let reconcilePayment = JSON.parse(
        localStorage?.getItem("auth") || "null",
      );

      if (reconcilePayment?.status == 500) {
        reconcilePayment = await LoginAPI.getIsAuth();
      }

      let head = getDataHead({
        name: "headNoticeCard",
      })?.welcome;

      if (!reconcilePayment?.payload?.data?.paying) {
        head = getDataHead({
          name: "headNoticeCard",
        })?.payment;
      }

      const dataUser = await Auth.getDataUser();

      const title = locale(head?.title, {
        name: dataUser?.name || "Student",
      });

      this.setState({
        headNoticeCard: head,
        title,
        isAuthenticated,
        role: dataUser?.role?.name,
        reconcilePayment,
      });
    } catch (err) {}
  }

  async attemptSubscribe() {
    this.setState({ loader: true });
    try {
      const res = await LoginAPI.postAttemptSubscription();

      if (res?.payload?.data?.reconciled) {
        const reconcilePayment = await LoginAPI.postReconcilePaymentStatus();
        this.setState({ loader: false, reconcilePayment });
      } else {
        window.open(res?.payload?.data?.url);
        this.setState({ loader: false });
      }
    } catch (error) {
      this.setState({ loader: false });
    }
  }

  async componentDidMount() {
    await this.initialize();
  }
  async componentDidUpdate(prevProps, prevState) {}

  render() {
    const {
      state: {
        mainClassName,
        headNoticeCard,
        title,
        isAuthenticated,
        role,
        reconcilePayment,
        loader,
      },
      props,
    } = this;

    if (role === "Teacher") {
      return (
        <ContentLayout title="" hideTitle={true}>
          <TeacherCard>
            <ClassRoom />
          </TeacherCard>
        </ContentLayout>
      );
    }

    if (role === "Admin") {
      return (
        <ContentLayout title="" hideTitle={true}>
          <AdminCard>
            <AdminManagement />
          </AdminCard>
        </ContentLayout>
      );
    }

    return (
      <ContentLayout className="dashboard-page-student-bg">
        <Loader isOpen={loader} />
        <StudentCard>
          <Stack className={mainClassName}>
            {/* {reconcilePayment && !reconcilePayment?.payload?.data?.paying ? (
              <NoticeCard
                {
                ...(headNoticeCard || {})
                }
                title={title}
                reconcilePayment={reconcilePayment}
                attemptSubscribe={this.attemptSubscribe}
              />
            ):( */}
            <StudentDashboard
              reconcilePayment={reconcilePayment}
              attemptSubscribe={this.attemptSubscribe}
              initialDashboardData={props.initialDashboardData}
            />
            {/* )} */}
          </Stack>
        </StudentCard>
      </ContentLayout>
    );
  }
}

export default withAppRouter(Dashboard);
