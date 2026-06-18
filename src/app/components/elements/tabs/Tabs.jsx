"use client";
import React, { Component } from "react";
import classnames from "classnames";

import { Tab, Tabs } from "@mui/material";

import { IconCustom, DropdownInput, IconButton } from "@/elements";
import { locale } from "@/app/data/locale";

function CustomTabs(props) {
  const {
    head,
    value,
    handleClick,
    scrollButtons,
    variant,
    useReset,
    useIndex,
  } = props;

  const mainClassName = "element-tabs-content-wrapper";

  const ItemTab = () => {
    return (
      <>
        {head?.length > 0 &&
          head.map((item, index) => {
            const id = item.hasOwnProperty("id") ? item.id : index;

            const isActiveIndex = (useIndex ? index : id) == value;

            return (
              <Tab
                key={"tab-" + index}
                className={
                  mainClassName +
                  "-item " +
                  (head[index]?.icon
                    ? head[index]?.icon
                    : isActiveIndex
                      ? "active"
                      : "")
                }
                onClick={() => handleClick(index, id)}
                label={locale(item.label)}
                icon={
                  item.icon ? (
                    <IconCustom icon={item.icon} size={item.iconSize} />
                  ) : null
                }
                iconPosition={item.icon ? item.iconPosition : null}
                value={id}
              ></Tab>
            );
          })}
      </>
    );
  };

  const isResetActive = useReset && value;

  return (
    <Tabs
      className={mainClassName}
      value={value}
      onChange={handleClick}
      variant={variant}
      scrollButtons={scrollButtons}
    >
      {isResetActive && (
        <div className={mainClassName + "-close-button "}>
          <IconButton
            icon={{
              name: "close",
              type: "mui",
            }}
            handleClick={() => handleClick("reset")}
          />
        </div>
      )}

      <div className={mainClassName + "-wrap-tab-item "}>
        <ItemTab />
      </div>
    </Tabs>
  );
}

export default class WrapTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
      mainClassName: "element-tabs",
    };
  }

  handleClick = (index, id) => {
    try {
      const {
        state: {},
        props: { handleChange, useToggle, useReset },
      } = this;

      let activeTab;

      if (index == "reset") {
        activeTab = null;
        id = null;
      } else if (id) {
        activeTab = id;
      } else {
        activeTab = index;
      }

      if (useToggle) {
        if (this.state.activeTab == id) {
          activeTab = null;
        }

        if (handleChange) {
          handleChange(activeTab);
        }
      } else {
        if (handleChange) {
          handleChange(id);
        }
      }

      this.setState({
        activeTab,
      });
    } catch (err) {}
  };

  async assignProps(onMount) {
    try {
      const {
        state: { activeTab },
        props: { useEmptyDefaultValue, value },
      } = this;

      const newActiveTab =
        onMount && useEmptyDefaultValue
          ? null
          : useEmptyDefaultValue
            ? value
            : value || activeTab || 0;

      this.setState({
        activeTab: newActiveTab,
      });
    } catch (err) {}
  }

  componentDidMount() {
    const {
      state: {},
      props: { head, value, useFirstIndexAsDefaultValue, handleChange },
    } = this;

    this.assignProps(true);
    if (useFirstIndexAsDefaultValue) {
      const activeTab = head[0]?.id;
      this.setState({
        activeTab: activeTab,
      });
      if (handleChange) {
        handleChange(activeTab);
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value != this.props.value) {
      this.assignProps();
    }
  }

  render() {
    const {
      state: { mainClassName, activeTab },
      props: {
        responsive,
        handleChange,
        head,
        theme,
        scrollButtons,
        variant,
        useToggle, //=> for toggle tabs
        useReset,
        useIndex,
      },
    } = this;

    const dataTheme = theme?.split(" ");
    const isPills = dataTheme?.includes("pills");
    const _variant = variant || (isPills ? "scrollable" : "fullWidth");

    const refactorClassName = classnames(
      mainClassName,
      theme,
      useReset ? "use-reset" : "",
      isPills ? "use-pills" : "",
      responsive ? "responsive" : "",
      activeTab ? "active-tab-applied" : "",
    );

    return (
      <div className={refactorClassName}>
        {responsive ? (
          <>
            <div className={mainClassName + "-content media-large"}>
              <CustomTabs
                useIndex={useIndex}
                head={head}
                value={activeTab}
                handleClick={this.handleClick.bind(this)}
                scrollButtons={scrollButtons}
                variant={_variant}
                useReset={useReset}
              />
            </div>
            <div className={mainClassName + "-content media-small"}>
              <DropdownInput
                data={head}
                value={activeTab}
                theme={responsive.theme}
                changeHandler={(e) => {
                  const id = e.target.value;
                  const index = head.findIndex((item) => item.id == id);
                  this.handleClick(index, id);
                }}
              />
            </div>
          </>
        ) : (
          <div className={mainClassName + "-content"}>
            <CustomTabs
              useIndex={useIndex}
              head={head}
              value={activeTab}
              handleClick={this.handleClick.bind(this)}
              scrollButtons={scrollButtons}
              variant={_variant}
              useReset={useReset}
            />
          </div>
        )}
      </div>
    );
  }
}
