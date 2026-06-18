"use client";
import React from "react";

function LoaderRing(props) {
  return (
    <div className="loader-ring">
      <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default LoaderRing;
