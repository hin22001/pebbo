"use client";
import { NoticeCard } from "@/modules";
import { Auth } from "@/src/app/data/local";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function StudentCard(props) {
  const router = useRouter();
  const [userRoleValid, setUserRoleValid] = useState(true);

  useEffect(() => {
    const validateAndRedirect = () => {
      const dataUser = Auth.getDataUser();
      if (dataUser === null) {
        router.push("/login");
      }
      setUserRoleValid(dataUser?.role?.name === "Student");
    };
    validateAndRedirect();
  }, []);

  return (
    <div
      className={
        "dashboard-page-student-bg" + (props?.wrapper ? "-wrapper" : "")
      }
    >
      {userRoleValid ? (
        <div>{props.children}</div>
      ) : (
        <div>
          <NoticeCard headType="pageNotFound" />
        </div>
      )}
    </div>
  );
}
