"use client";
import React from "react";

export default function Paragraph(props) {
  const { label, data, theme, useNumber } = props;

  return (
    <div className={"paragraph " + (theme || "")}>
      {label && <h3 className="title">{label}</h3>}
      {typeof data == "string" ? (
        <p className="wrap-paragraph">{data}</p>
      ) : typeof data == "object" && data.length > 0 && useNumber ? (
        <ol className="wrap-number">
          {data.map((item, index) => (
            <li
              className="wrap-paragraph"
              key={"data-paragraph-content-" + index}
            >
              {item.label}
            </li>
          ))}
        </ol>
      ) : (
        data.map((item, index) => (
          <p className="wrap-paragraph" key={"data-paragraph-content-" + index}>
            {item.label}
          </p>
        ))
      )}
    </div>
  );
}
