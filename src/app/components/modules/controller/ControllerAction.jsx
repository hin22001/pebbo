"use client";
import { Checkbox } from "@mui/material";
import React from "react";
import { DropdownButton } from "../../elements";

export default function index(props) {
  const {
    dropdownAction,
    isSelectAll,
    disableSelectAll,
    disableAction,
    selectedNumber,
    id,
    head,
  } = props;

  // head = {
  //   labelSelectAll,
  //   labelUnitSelected,
  //   DropdownButton,
  // }

  const handleChangeCheckbox = (e) => {
    if (props.handleChangeCheckbox) {
      props.handleChangeCheckbox(e);
    }
  };

  const handleChangeDropdown = (item) => {
    if (props.handleChangeDropdown) {
      props.handleChangeDropdown({
        id: id,
        action: item,
      });
    }
  };

  return (
    <div className="controller-action">
      <div className="select-all">
        <Checkbox
          value={id}
          checked={isSelectAll}
          onChange={handleChangeCheckbox}
          disabled={disableSelectAll}
        />
        <span>{head.labelSelectAll}</span>|
        <span>{selectedNumber + " " + head.labelUnitSelected}</span>
      </div>

      {/* <div className='minimize'>
        <Checkbox
          onChange={this.handleChangeCheckbox.bind(this, 'minimize')}
        />
        <span>{this.props.head.labelSelectAll}</span>
      </div> */}

      <div className="action">
        <DropdownButton
          {...head.DropdownButton}
          disabled={disableAction}
          data={dropdownAction}
          returnItem={true}
          handleSelect={handleChangeDropdown}
        />
      </div>
    </div>
  );
}
