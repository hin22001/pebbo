"use client";
import React, { Component, useEffect, useState } from "react";
import { getDataHead } from "@/src/app/data/head";
import { Card, Stack, Typography } from "@mui/material";
import Chart from "@/modules/chart/Chart";
import CustomButton from "@/modules/form/CustomButton";
import CustomDateTeacher from "@/modules/form/CustomDateTeacher";
import CustomSelect from "@/modules/form/CustomSelect";
import TeacherCard from "@/modules/card/TeacherCard";
import { Auth } from "@/src/app/data/local";
import { ContentLayout } from "@/layouts/ContentLayout";
import { useRouter } from "next/navigation";
import { ImageHandler } from "../../elements";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { locale } from "@/src/app/data/locale";
import { DatePicker } from "@mui/x-date-pickers";
import { Helpers } from "@/src/app/utils";

export default function ClassPlanning() {
  const [head, setHead] = useState(null);
  const [openSelectCurriculum, setOpenSelectCurriculum] = useState(false);
  const [openSemester1, setOpenSemester1] = useState(false);
  const [openSemester2, setOpenSemester2] = useState(false);
  const [curriculum, setCurriculum] = useState(null);
  const [semester1, setSemester1] = useState([
    "Curriculum 1",
    "Curriculum 2",
    "Curriculum 3",
  ]);
  const [semester2, setSemester2] = useState([
    "Curriculum 4",
    "Curriculum 5",
    "Curriculum 6",
  ]);

  const mainClassName = "class-planning-page";

  const optionCurriculum = [
    { value: "Curriculum 1", label: "Curriculum 1" },
    { value: "Curriculum 2", label: "Curriculum 2" },
    { value: "Curriculum 3", label: "Curriculum 3" },
  ];

  const optionCategory = [
    { value: "Category 1", label: "Category 1" },
    { value: "Category 2", label: "Category 2" },
    { value: "Category 3", label: "Category 3" },
  ];

  useEffect(() => {
    const head = getDataHead({
      name: "headClassPlanning",
    });
    setHead(head);
  }, []);

  const lang = Helpers.getCurrentLanguage();

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Stack width="100%" alignItems="center">
          <Stack
            mt={2}
            mb={2}
            width="80%"
            justifyContent="center"
            alignItems="center"
          >
            <Stack
              mb={5}
              width="80%"
              justifyContent="space-between"
              direction="row"
            >
              <Typography className={mainClassName + "-title"} fontWeight={600}>
                {locale(head?.header?.class)}
              </Typography>
              <Typography
                className={mainClassName + "-title"}
                fontWeight={800}
                color="#8264FF"
              >
                2A
              </Typography>
              <Typography className={mainClassName + "-title"} fontWeight={600}>
                {locale(head?.header?.classCode)}
              </Typography>
              <Typography
                className={mainClassName + "-title"}
                fontWeight={800}
                color="#8264FF"
              >
                H5RS2A
              </Typography>
            </Stack>
            <Stack width="100%">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                headerToolbar={{
                  left: "title",
                  center: "",
                  right: "prev,next",
                }}
                initialView="dayGridMonth"
                // initialDate={startDate}
                weekends={true}
                events={[]}
                // eventContent={renderEventContentDesktop}
                dayMaxEvents={true}
                // moreLinkClick={onSelectDate}
                // dateClick={onSelectDate}
                // dayCellContent={({ date }) => (
                //   <CustomDayCellDesktop date={date} />
                // )}
                dayCellDidMount={(arg) => {
                  const cellDate = new Date(arg.date);
                  const today = new Date();
                  if (cellDate.toDateString() === today.toDateString()) {
                    arg.el.style.backgroundColor = "#9747FF";
                    arg.el.style.color = "white";
                  }
                }}
                locale={lang}
              />
            </Stack>
          </Stack>

          <Stack width="100%">
            {/* <Card className={mainClassName + '-card'}>
              <Stack justifyContent="center" alignItems="center">
                <Typography fontSize={14} color="#565656" fontWeight={600} textAlign="center">Set your Class Categories.</Typography>
                <Typography fontSize={14} color="#565656" fontWeight={400} textAlign="center">Align your class&apos;s curriculum with your students.</Typography>
                <Typography mt={2} mb={2} fontSize={14} color="#565656" fontWeight={600} textAlign="center">Default Curriculum</Typography>
                <Stack width="100%" mb={2}>
                  <CustomSelect
                    setValue={setCurriculum}
                    setModalOpen={setOpenSelectCurriculum}
                    isOpen={openSelectCurriculum}
                    selectedValue={curriculum}
                    option={optionCurriculum}
                    noLabel={true}
                    alignContent="start"
                    placeholder="eg. HK Primary Education Curriculum"
                  />
                </Stack>

                <CustomButton label="Update" />

                <Stack className={'dashboard-page-line-wrapper'}>
                  <Stack className={'dashboard-page-line'}/>
                  <Stack className={'dashboard-page-line-text-wrapper'}>
                    <Typography className={'dashboard-page-subtitle'}>Or</Typography>
                  </Stack>
                </Stack>

                <Typography mb={2} fontSize={14} color="#565656" fontWeight={600} textAlign="center">Manual Curriculum Setting</Typography>
                <Stack width="100%" mb={2} alignItems="center">
                  <Stack width="70%">
                    <CustomSelect
                      label="First Semester"
                      setValue={(e) => {

                        setSemester1(e)
                      }}
                      setModalOpen={setOpenSemester1}
                      isOpen={openSemester1}
                      selectedValue={semester1}
                      option={optionCategory}
                      alignContent="start"
                      alignLabel="start"
                      multiple={true}
                      placeholder="Select Categories"
                    />
                    <Stack mb={1} direction="row" justifyContent="center">
                      <Stack width="50%" justifyContent="center">
                        <Typography fontSize={12} fontWeight={300}>Period</Typography>
                      </Stack>
                      <Stack width="100%" paddingRight="10%" paddingLeft="5%">
                        <CustomDateTeacher placeholder="Set dates on Calendar"/>
                      </Stack>
                    </Stack>
                    <CustomSelect
                      label="Second Semester"
                      setValue={setSemester2}
                      setModalOpen={setOpenSemester2}
                      isOpen={openSemester2}
                      selectedValue={semester2}
                      option={optionCategory}
                      alignContent="start"
                      alignLabel="start"
                      multiple={true}
                      placeholder="Select Categories"
                    />
                    <Stack mb={1} direction="row" justifyContent="center">
                      <Stack width="50%" justifyContent="center">
                        <Typography fontSize={12} fontWeight={300}>Period</Typography>
                      </Stack>
                      <Stack width="100%" paddingRight="10%" paddingLeft="5%">
                        <CustomDateTeacher placeholder="Set dates on Calendar"/>
                      </Stack>
                    </Stack>
                    <Stack mt={1} mb={1} direction="row" justifyContent="center">
                      <Stack width="50%" justifyContent="center">
                        <Typography fontSize={12} fontWeight={300}>Exam Date</Typography>
                      </Stack>
                      <Stack width="100%" paddingRight="10%" paddingLeft="5%">
                        <CustomDateTeacher placeholder="Set dates on Calendar"/>
                      </Stack>
                    </Stack>

                    <Stack mt={3} alignItems="center">
                      <CustomButton label="Update" />
                    </Stack>
                  </Stack>
                </Stack>

              </Stack>
            </Card> */}

            {/* <Stack width="100%">
              <Card className={mainClassName + '-card'}>
                <Typography mb={2} fontSize={14} color="#565656" fontWeight={600} textAlign="center">Configure Curriculum Schedule for Student Alignment.</Typography>
                
                <Typography mb={1} fontSize={12} color="#565656" fontWeight={400} textAlign="center">First Semester</Typography>
                <Stack alignItems="center">
                  {semester1?.map((val, i) => (
                    <Stack mt={1} mb={1} key={i} width="80%" direction="row" justifyContent="space-between">
                      <Stack mt={1} width="20%" justifyContent="center" alignItems="center">
                        <Typography mb={2} fontSize={12} color="#565656" fontWeight={400}>Topic {i + 1} - {val}</Typography>
                      </Stack>
                      <Stack width="35%">
                        <CustomDateTeacher placeholder="Start Date"/>
                      </Stack>
                      <Stack width="35%">
                        <CustomDateTeacher placeholder="End Date"/>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
                
                <Typography mt={2} mb={1} fontSize={12} color="#565656" fontWeight={400} textAlign="center">Second Semester</Typography>
                <Stack alignItems="center">
                  {semester2?.map((val, i) => (
                    <Stack mt={1} mb={1} key={i} width="80%" direction="row" justifyContent="space-between">
                      <Stack mt={1} width="20%" justifyContent="center" alignItems="center">
                        <Typography mb={2} fontSize={12} color="#565656" fontWeight={400}>Topic {i + 1} - {val}</Typography>
                      </Stack>
                      <Stack width="35%">
                        <CustomDateTeacher placeholder="Start Date"/>
                      </Stack>
                      <Stack width="35%">
                        <CustomDateTeacher placeholder="End Date"/>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>

              </Card>
            </Stack> */}
          </Stack>
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}
