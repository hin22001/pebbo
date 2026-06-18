"use client";
import React, { Component } from "react";
import NoticeCard from "@/modules/card/NoticeCard";

export default class NotFoundPage extends Component {
  render() {
    return (
      <main className="templates-not-found-page">
        <NoticeCard headType="pageNotFound" />
      </main>
    );
  }
}
