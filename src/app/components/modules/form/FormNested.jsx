import React, { Component } from "react";
import { getDataHead } from "@/src/data/head";
import { Stack } from "@mui/material";
import { FormGenerator } from ".";

export default class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "module-form-nested",
    };
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

  async componentDidMount() {}

  render() {
    const {
      state: { mainClassName },
      props: { head },
    } = this;

    return (
      <Stack className={mainClassName}>
        {head && <FormGenerator head={head.forms} />}
      </Stack>
    );
  }
}
