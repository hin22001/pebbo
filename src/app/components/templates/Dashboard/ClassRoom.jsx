"use client";
import {
  Card,
  Select,
  Stack,
  Typography,
  MenuItem,
  Modal,
  Box,
} from "@mui/material";
import React, { Component, useEffect, useState } from "react";
import { Alert, ImageHandler, Loader } from "../../elements";
import { LocalData } from "@/src/app/data/local";
import { getDataHead } from "@/src/app/data/head";
import { locale } from "@/src/app/data/locale";
import { CustomSelect } from "../../modules";
import { ClassAPI } from "@/src/app/data/api";
import { ClassroomList } from "../ClassroomList";

export default function ClasRoom(props) {
  const [openSelectSchool, setOpenSelectSchool] = useState(false);
  const [school, setSchool] = useState(null);
  const [openSelectGrad, setOpenSelectGrad] = useState(false);
  const [grad, setGrad] = useState(null);
  const [openSelectSubject, setOpenSelectSubject] = useState(false);
  const [subject, setSubject] = useState(null);
  const [modal, setModal] = useState(false);
  const [alert, setAlert] = useState(false);
  const [loader, setLoader] = useState(false);
  const [className, setClassName] = useState("");
  const head = getDataHead({ name: "headDashboardPage" });

  const mainClassName = "dashboard-page";

  const optionSchool = [
    { value: "School 1", label: "School 1" },
    { value: "School 2", label: "School 2" },
    { value: "School 3", label: "School 3" },
  ];

  const optionGrad = [
    { value: "Grad 1", label: "Grad 1" },
    { value: "Grad 2", label: "Grad 2" },
    { value: "Grad 3", label: "Grad 3" },
  ];

  const optionSubject = [
    { value: "Subject 1", label: "Subject 1" },
    { value: "Subject 2", label: "Subject 2" },
    { value: "Subject 3", label: "Subject 3" },
  ];

  const styleModal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "#fff",
    borderRadius: "20px",
    outline: "none",
  };

  const onCreateClassroom = async () => {
    if (className?.length > 0) {
      setLoader(true);
      try {
        await ClassAPI.createClassroomTeacher(
          {},
          {
            classroom_name: className,
          },
        );
        setAlert(true);
        setClassName("");
      } catch (error) {}
      setModal(false);
      setLoader(false);
    }
  };

  useEffect(() => {
    const modalTeacher = LocalData.getData("modalTeacher");
    setTimeout(() => {
      if (modalTeacher) {
        setModal(true);
        LocalData.removeData("modalTeacher");
      }
    }, 1000);
  }, []);

  return (
    <Stack pb={50}>
      <Loader isOpen={loader} />
      <Card className={mainClassName + "-card"}>
        <Typography className={mainClassName + "-title"}>
          {locale(head?.title)}
        </Typography>
        <Stack className={mainClassName + "-form-group"}>
          {/* <CustomSelect
            label={locale(head?.labelSchool)}
            setValue={setSchool}
            setModalOpen={setOpenSelectSchool}
            isOpen={openSelectSchool}
            selectedValue={school}
            option={optionSchool}
          />
          <CustomSelect
            label={locale(head?.labelGrad)}
            setValue={setGrad}
            setModalOpen={setOpenSelectGrad}
            isOpen={openSelectGrad}
            selectedValue={grad}
            option={optionGrad}
          /> */}
          <CustomSelect
            label={locale(head?.labelSubject)}
            setValue={setSubject}
            setModalOpen={setOpenSelectSubject}
            isOpen={openSelectSubject}
            selectedValue={subject}
            option={optionSubject}
          />

          <Stack className={mainClassName + "-form-btn-wrapper"}>
            <Stack className={mainClassName + "-form-btn"}>
              <Typography className={mainClassName + "-form-btn-txt"}>
                {locale(head?.labelBtnCreate)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Card>

      <Card className={mainClassName + "-card"}>
        <Alert
          isOpen={alert}
          message="Classroom created successfully"
          type="success"
          handleClose={() => setAlert(false)}
        />
        <Typography className={mainClassName + "-title"}>
          {locale(head?.createClassroom)}
        </Typography>
        <Stack className={mainClassName + "-form-group"}>
          <Stack direction="row" className={mainClassName + "-form-row"}>
            <Stack className={mainClassName + "-form-label"}>
              <Typography className={mainClassName + "-form-text"}>
                {locale(head?.labelClassroom)}
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
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className={mainClassName + "-form-input-text"}
                        placeholder={`(${locale(head?.placeholderClassName)})`}
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          <Stack className={mainClassName + "-form-btn-wrapper"}>
            <Stack
              onClick={onCreateClassroom}
              className={
                mainClassName +
                "-form-btn" +
                (className?.length === 0 ? "-disabled" : "")
              }
            >
              <Typography className={mainClassName + "-form-btn-txt"}>
                {locale(head?.labelBtnCreate)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Card>

      <ClassroomList role="teacher" />

      {/* <Card className={mainClassName + '-card'}>
        <Typography className={mainClassName + '-subtitle'}>{locale(head?.assignClass)}</Typography>
        <Stack className={mainClassName + '-form-btn-wrapper'}>
          <Stack className={mainClassName + '-form-btn'}>
            <Typography className={mainClassName + '-form-btn-txt'}>{locale(head?.labelBtnCreateClass)}</Typography>
          </Stack>
        </Stack>

        <Stack className={mainClassName + '-line-wrapper'}>
          <Stack className={mainClassName + '-line'}/>
          <Stack className={mainClassName + '-line-text-wrapper'}>
            <Typography className={mainClassName + '-subtitle'}>{locale(head?.or)}</Typography>
          </Stack>
        </Stack>

        <Stack mt={-1} justifyContent='center' alignItems='center'>
          <Typography className={mainClassName + '-subtitle'}>{locale(head?.uploadCsv)}</Typography>
          <Stack mt={3} justifyContent='center' className={mainClassName + '-file-wrapper'}>
            <Stack className={mainClassName + '-file-inner'}>
              <Typography className={mainClassName + '-file-title'}>{locale(head?.browseFile1)}<br/>{locale(head?.browseFile2)}<br/>↑</Typography>
            </Stack>
          </Stack>
        </Stack>

      </Card> */}

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
          <Typography className={mainClassName + "-subtitle"}>
            {locale(head?.modal?.title)}
          </Typography>
          <Typography className={mainClassName + "-description"}>
            {locale(head?.modal?.subtitle)}
          </Typography>
          <Stack
            pb={4}
            onClick={() => setModal(false)}
            className={mainClassName + "-form-btn-wrapper"}
          >
            <Stack className={mainClassName + "-form-btn"}>
              <Typography className={mainClassName + "-form-btn-txt"}>
                {locale(head?.modal?.btn)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </Stack>
  );
}
