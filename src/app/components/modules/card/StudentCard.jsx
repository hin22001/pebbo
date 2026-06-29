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
      // role can be the canonical object {id, name} OR the raw string "student"
      // (older/corrupted localStorage). Accept both so a bad-shaped role doesn't
      // false-render the 404 instead of redirecting.
      const role = dataUser?.role;
      const roleName = typeof role === "string" ? role : role?.name;
      setUserRoleValid(String(roleName).toLowerCase() === "student");
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
