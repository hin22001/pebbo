"use client";
import { NoticeCard } from "@/modules";
import { Auth } from "@/src/app/data/local";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCard(props) {
  const router = useRouter();
  const [userRoleValid, setUserRoleValid] = useState(true);

  useEffect(() => {
    const validateAndRedirect = () => {
      const dataUser = Auth.getDataUser();
      if (dataUser === null) {
        router.push("/login");
      }
      setUserRoleValid(dataUser?.role?.name === "Admin");
    };
    validateAndRedirect();
  }, []);

  return (
    <div>
      {userRoleValid ? (
        <div className={"teacher-notice-card"}>{props.children}</div>
      ) : (
        <div>
          <NoticeCard headType="pageNotFound" />
        </div>
      )}
    </div>
  );
}
