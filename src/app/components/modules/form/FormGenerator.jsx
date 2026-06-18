"use client";
import React, { Component } from "react";
import { Stack, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import {
  Button,
  DropdownInput,
  IconButton,
  Skeleton,
} from "@/components/elements";
import { getLabel, locale } from "@/app/data/locale";
import { Helpers } from "@/app/utils";
import { connect } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import { Fields } from "./sections";
import _ from "lodash";
import FormGeneratorHelpers from "./FormGeneratorHelpers";

class FormGenerator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "module-form-generator",
      disableSubmit: true,
      dataDropdown: {},
      validationForm: {},
      formikValues: {},
      formNestedValue: {},
      formNested: {}, // detail of nested form will be here
    };
    this.refFormik = React.createRef();
    this.refFormChild = React.createRef();
  }

  convertDateRangeName(formikAttribute, formKeys) {
    // formikAttribute e.g : formik.values

    const result = {
      startDate: formikAttribute[formKeys + "_startDate"] || "",
      endDate: formikAttribute[formKeys + "_endDate"] || "",
    };

    return result;
  }

  async updateValidation(disableSubmit) {
    try {
      const newValue =
        typeof disableSubmit == "boolean"
          ? disableSubmit
          : !this.refFormik?.isValid;

      this.setState({
        disableSubmit: newValue,
      });
    } catch (err) {}
  }

  updateFormNestedValue(params) {
    try {
      const {
        currentFormNestedValue,

        formKeys,
        formChildItem,
        formikValues,
        values,
      } = params;

      let refactorFormNestedValue = { ...(currentFormNestedValue || {}) };

      const refactorValue = {
        id: formChildItem?.id,
        value:
          typeof formikValues[formKeys] == "string"
            ? {
                ...(_.has(values, formKeys) ? values[formKeys] : {}),
                value: formikValues[formKeys],
              }
            : _.has(values, formKeys)
              ? values[formKeys]
              : formikValues,
      };

      if (_.has(formChildItem, "forms") && formChildItem?.forms[formKeys]) {
        // => {
      }

      // ==============================================
      // ==== REFACTOR FORM NESTED TO NESTED VALUE ====
      // ==============================================

      if (_.has(refactorFormNestedValue, formKeys)) {
        // exist

        if (_.has(refactorFormNestedValue[formKeys], "child")) {
          // child exist

          if (Array.isArray(refactorFormNestedValue[formKeys]["child"])) {
            if (refactorFormNestedValue[formKeys]["child"]?.length > 0) {
              const foundIndex = refactorFormNestedValue[formKeys][
                "child"
              ].findIndex((item) => item.id == formChildItem?.id);

              if (foundIndex >= 0) {
                refactorFormNestedValue[formKeys]["child"][foundIndex] =
                  refactorValue;
              } else {
                refactorFormNestedValue[formKeys]["child"] = [
                  ...refactorFormNestedValue[formKeys]["child"],
                  refactorValue,
                ];
              }
            } else {
              refactorFormNestedValue[formKeys]["child"].push(refactorValue);
            }
          }
        } else {
          refactorFormNestedValue[formKeys]["child"] = [refactorValue];
        }
      } else {
        refactorFormNestedValue[formKeys] = {};
        refactorFormNestedValue[formKeys]["child"] = [refactorValue];
      }

      refactorFormNestedValue[formKeys]["value"] =
        this.refFormik?.values[formKeys];

      return refactorFormNestedValue;
    } catch (err) {
      return params?.currentFormNestedValue;
    }
  }

  async handleEvent(params) {
    try {
      let {
        state: {
          head,
          initialValues,
          dataDropdown,
          validationForm,
          formNested,
        },
        props: { onChangeValue, isNestedChild },
      } = this;

      let formNestedValue = { ...this.state.formNestedValue };

      switch (params?.type) {
        case "delete-child":
          {
            try {
              const { formKeys, formChildItem, formChildIndex } = params;

              let refactorFormNested = { ...(formNested || {}) };
              let refactorFormNestedValue = { ...(formNestedValue || {}) };

              if (_.has(refactorFormNested, formKeys)) {
                if (_.has(refactorFormNested[formKeys], "child")) {
                  if (Array.isArray(refactorFormNested[formKeys]["child"])) {
                    refactorFormNested[formKeys]["child"] = refactorFormNested[
                      formKeys
                    ].child.filter(
                      (item, index) => formChildItem?.id != item.id
                    );
                  } else {
                    refactorFormNested[formKeys]["child"] = [];
                  }
                } else {
                  refactorFormNested[formKeys]["child"] = [];
                }
              } else {
                refactorFormNested = {
                  [formKeys]: {
                    child: [],
                  },
                };
              }

              if (_.has(refactorFormNestedValue, formKeys)) {
                if (_.has(refactorFormNestedValue[formKeys], "child")) {
                  if (
                    Array.isArray(refactorFormNestedValue[formKeys]["child"])
                  ) {
                    refactorFormNestedValue[formKeys]["child"] =
                      refactorFormNestedValue[formKeys].child.filter(
                        (item, index) => formChildItem?.id != item.id
                      );
                  } else {
                    refactorFormNestedValue[formKeys]["child"] = [];
                  }
                } else {
                  refactorFormNestedValue[formKeys]["child"] = [];
                }
              } else {
                refactorFormNestedValue = {
                  [formKeys]: {
                    child: [],
                  },
                };
              }

              this.setState({
                triggerChildFormUpdated: true,
                formNested: refactorFormNested,
                formNestedValue: refactorFormNestedValue,
              });

              formNestedValue = refactorFormNestedValue;

              Helpers.sleep(500);
              this.setState({
                triggerChildFormUpdated: false,
              });
            } catch (err) {}
          }
          break;

        case "add-child":
          {
            const { formKeys, length, formNestedItem } = params;

            let newForms = {};

            newForms = formNested[formKeys]?.forms;

            const newField = {
              id: _.uniqueId(),
              forms: {
                ...(newForms || {}),
              },
            };
            const newFieldValue = {
              id: newField?.id,
              value: null,
            };

            let refactorFormNested = { ...(formNested || {}) };
            let refactorFormNestedValue = { ...(formNestedValue || {}) };

            // ===============================================
            // ================ FORM NESTED ==================
            // ===============================================

            if (_.has(refactorFormNested, formKeys)) {
              if (_.has(refactorFormNested[formKeys], "child")) {
                if (Array.isArray(refactorFormNested[formKeys]["child"])) {
                  refactorFormNested[formKeys]["child"].push(newField);
                } else {
                  refactorFormNested[formKeys]["child"] = [newField];
                }
              } else {
                refactorFormNested[formKeys]["child"] = [newField];
              }
            } else {
              refactorFormNested = {
                [formKeys]: {
                  child: [newField],
                },
              };
            }

            // ===============================================
            // ============= FORM NESTED VALUE ===============
            // ===============================================

            if (_.has(refactorFormNestedValue, formKeys)) {
              if (_.has(refactorFormNestedValue[formKeys], "child")) {
                if (Array.isArray(refactorFormNestedValue[formKeys]["child"])) {
                  refactorFormNestedValue[formKeys]["child"].push(
                    newFieldValue
                  );
                } else {
                  refactorFormNestedValue[formKeys]["child"] = [newFieldValue];
                }
              } else {
                refactorFormNestedValue[formKeys]["child"] = [newFieldValue];
              }
            } else {
              refactorFormNestedValue = {
                [formKeys]: {
                  child: [newFieldValue],
                },
              };
            }

            this.setState({
              triggerChildFormUpdated: true,
              formNested: refactorFormNested,
              formNestedValue: refactorFormNestedValue,
            });
            Helpers.sleep(500);
            this.setState({
              triggerChildFormUpdated: false,
            });
          }
          break;

        case "chip-stack":
          {
            if (params?.event?.target?.value) {
              let values = this.refFormik.values[params?.formKeys] || [];

              const value = params?.event?.target?.value;

              values.push({
                label: value,
                id: _.uniqueId(),
                checked: false,
              });

              values = _.uniq(values.filter((item) => item));

              await this.refFormik.setFieldValue(
                params?.formKeys,
                values,
                true
              );

              await this.updateValidation();
            }
          }
          break;

        case "chip-stack-delete":
          {
            let values = this.refFormik.values[params?.formKeys] || [];

            const value = params?.value;

            values = _.uniq(values.filter((item) => item?.id != value?.id));

            await this.refFormik.setFieldValue(params?.formKeys, values, true);

            await this.updateValidation();
          }
          break;

        case "chip-stack-checkbox":
          {
            let currentIndex = params.index;

            let values = this.refFormik.values[params?.formKeys] || [];
            const refactorValues = values.map((item, index) => {
              if (index == currentIndex) {
                let checked = params.event.target.checked;

                return {
                  ...(item || {}),
                  label: item?.label || item,
                  checked,
                };
              }

              return {
                ...(item || {}),
                label: item?.label || item,
              };
            });

            await this.refFormik.setFieldValue(
              params?.formKeys,
              refactorValues,
              true
            );
          }
          break;

        case "change-date":
          {
            const value = params.value;
            await this.refFormik.setFieldValue(params?.formKeys, value, true);
            await this.updateValidation();
          }
          break;

        case "change-dropdown":
          {
            this.updateValidation();

            const { formik, value, objData, multiple, formKeys, formItem } =
              params;

            // === Update Formik Value ===

            if (multiple) {
              const data = value?.flatMap((item) => item.id);
              await formik.setFieldValue(formKeys, data, true);
            } else {
              await formik.setFieldValue(formKeys, value?.id || value, true);
            }

            // === For Wired Field ===

            if (formItem?.updateNextField) {
              // ===> array of object

              try {
                // === Wired Dropdown ===

                const newDataDropdown = { ...(dataDropdown || {}) };

                if (value) {
                  // ==== Initial State ====

                  formItem?.updateNextField.forEach(async (targetField) => {
                    const itemNextField = head[targetField?.id];

                    switch (itemNextField?.type) {
                      case "dropdown":
                        {
                          itemNextField["dropdown"]["data"] = [];
                          itemNextField["dropdown"]["loading"] = true;
                          itemNextField["elementKey"] =
                            Helpers.randomNumber(100);
                          // formik.setFieldValue(targetField?.id, '', true)
                        }
                        break;

                      default:
                        {
                          // === inital state on function handled by parent ===
                          // await this.props.assignMainLayout({
                          //   type: 'ASSIGN_OPEN_LOADER',
                          // })
                        }
                        break;
                    }
                  });

                  await this.setState({
                    head: { ...(head || {}) },
                  });
                  await formik.validateForm();

                  // ==== Execute Function ====

                  async function setHead(i, _this) {
                    const updateNextFieldItem = formItem?.updateNextField[i];

                    const itemNextFieldID = updateNextFieldItem?.id;

                    let itemNextField = { ...(head[itemNextFieldID] || {}) };
                    let itemNextFieldInjectValue;

                    switch (itemNextField?.type) {
                      case "dropdown":
                        {
                          if (itemNextField["dropdown"].getData) {
                            const fetchData =
                              await itemNextField["dropdown"].getData(value);

                            itemNextField["dropdown"]["data"] = fetchData || [];
                            itemNextField["elementKey"] =
                              Helpers.randomNumber(100);
                            itemNextField["dropdown"]["loading"] = false;
                            newDataDropdown[itemNextField.id] = fetchData || [];
                            formik.setFieldValue(itemNextFieldID, null, true);
                          }
                        }
                        break;

                      default:
                        {
                          // === on function handled by parent ===

                          if (updateNextFieldItem?.assignValue) {
                            const itemNextField_HasBeenUpdated =
                              updateNextFieldItem.assignValue({
                                itemNextField,
                                value,
                                itemNextFieldID,
                                values: formik?.values,
                              });

                            itemNextField =
                              itemNextField_HasBeenUpdated?.formItem;

                            itemNextFieldInjectValue =
                              itemNextField_HasBeenUpdated?.itemNextFieldInjectValue;
                          }
                        }
                        break;
                    }

                    // === On Update Validation ===

                    if (updateNextFieldItem?.updateValidation) {
                      formik.validateForm(true);

                      switch (itemNextField?.type) {
                        case "date-range":
                        case "date-picker-range-uncontrolled":
                          {
                            const labelIsRequired = getLabel({
                              name: "isRequired",
                            });

                            if (itemNextField?.required?.startDate) {
                              validationForm[itemNextFieldID + "_startDate"] =
                                yup
                                  .date()
                                  .typeError(getLabel({ name: "invalidDate" }))
                                  .required(
                                    itemNextField?.required.startDate
                                      ? locale(
                                          itemNextField?.labels.startDate
                                        ) +
                                          " " +
                                          labelIsRequired
                                      : false
                                  );
                            } else {
                              validationForm = Helpers.filterObjectByKey(
                                validationForm,
                                itemNextFieldID + "_startDate"
                              );
                            }

                            if (itemNextField?.required?.endDate) {
                              validationForm[itemNextFieldID + "_endDate"] = yup
                                .date()
                                .typeError(getLabel({ name: "invalidDate" }))
                                .required(
                                  itemNextField?.required.endDate
                                    ? locale(itemNextField?.labels.endDate) +
                                        " " +
                                        labelIsRequired
                                    : false
                                );
                            } else {
                              validationForm = Helpers.filterObjectByKey(
                                validationForm,
                                itemNextFieldID + "_endDate"
                              );
                            }
                          }
                          break;
                      }
                    }

                    // === Add handle Inject Value ===

                    if (
                      updateNextFieldItem?.injectValue &&
                      itemNextFieldInjectValue
                    ) {
                      switch (itemNextField?.type) {
                        case "date-range":
                        case "date-picker-range-uncontrolled":
                          {
                            if (
                              itemNextFieldInjectValue?.hasOwnProperty(
                                "startDate"
                              )
                            ) {
                              await formik.setFieldValue(
                                itemNextFieldID + "_startDate",
                                itemNextFieldInjectValue.startDate,
                                true
                              );
                            }

                            if (
                              itemNextFieldInjectValue?.hasOwnProperty(
                                "endDate"
                              )
                            ) {
                              // initialValues[itemNextFieldID + '_endDate'] = itemNextField?.defaultValue.endDate
                              await formik.setFieldValue(
                                itemNextFieldID + "_endDate",
                                itemNextFieldInjectValue.endDate,
                                true
                              );
                            }
                          }
                          break;

                        case "string":
                          {
                            await formik.setFieldValue(
                              itemNextFieldID,
                              itemNextFieldInjectValue,
                              true
                            );
                          }
                          break;
                      }
                    }

                    // === Udate Head ===

                    head[itemNextFieldID] = { ...itemNextField };

                    await _this.setState({
                      head: { ...(head || {}) },
                    });
                  }

                  // ======= Force Validation on Finish ==========

                  // === Execute Function on Delay ===

                  await Helpers.delayFunction({
                    func: setHead,
                    length: formItem?.updateNextField?.length,
                    delay: 200,
                    _this: this,
                  });

                  await this.props.assignMainLayout({
                    type: "ASSIGN_CLOSE_LOADER",
                  });
                } else {
                  formItem?.updateNextField.forEach((targetField) => {
                    const itemNextField = head[targetField?.id];

                    if (itemNextField?.type == "dropdown") {
                      itemNextField["dropdown"]["data"] = [];
                      itemNextField["dropdown"]["loading"] = false;
                    } else {
                    }

                    formik.setFieldValue(
                      targetField?.id,
                      initialValues[targetField?.id],
                      true
                    );
                  });
                }

                const validationSchema = yup.object(validationForm);

                await this.setState({
                  head: { ...(head || {}) },
                  dataDropdown: newDataDropdown,
                  initialValues,
                  validationSchema: validationSchema,
                  validationForm: { ...(validationForm || {}) },
                });

                setTimeout(async () => {
                  await formik.validateForm();
                  await this.updateValidation();
                }, 500);
              } catch (err) {}
            }
          }
          break;

        case "change-date-range":
          {
            await this.refFormik.setFieldValue(
              params?.formKeys + "_startDate",
              params?.value?.startDate
                ? new Date(params?.value?.startDate)
                : "",
              true
            );
            await this.refFormik.setFieldValue(
              params?.formKeys + "_endDate",
              params?.value?.endDate ? new Date(params?.value?.endDate) : "",
              true
            );
          }
          break;

        case "text-field-handle-change":
          {
            this.updateValidation();
            this.refFormik.handleChange(params?.event);
          }
          break;

        case "text-field-handle-blur":
          {
            this.updateValidation();
            this.refFormik.handleBlur(params?.event);
          }
          break;

        case "field-switch":
          {
            this.updateValidation();
            const checked = !Boolean(params?.value);

            await this.refFormik.setFieldValue(params?.formKeys, checked, true);
          }
          break;

        case "file":
          {
            const value = params.value;

            await this.refFormik.setFieldValue(params?.formKeys, value, true);
            await this.updateValidation();
          }
          break;

        case "file-still-loading":
          {
            await this.updateValidation(params?.value);
          }
          break;

        case "submit":
          {
            // === For Array Data (Dropdown) ===

            const fullData = {};
            let isValid = true;

            Object.keys(this.refFormik.values)?.forEach((item) => {
              const fieldValue = this.refFormik.values[item];

              const formItem = head[item];

              const fieldDropdown =
                formItem?.dropdown?.data?.length > 0
                  ? formItem?.dropdown?.data
                  : dataDropdown[item];

              if (formItem?.type == "dropdown" && fieldDropdown?.length > 0) {
                if (Array.isArray(fieldValue)) {
                  // === multiple ===

                  fullData[item] = fieldDropdown.filter((item) =>
                    fieldValue.includes(item.id)
                  );
                } else {
                  fullData[item] = fieldDropdown.find(
                    (item) => item.id == fieldValue
                  );
                }
              } else if (item.split("_")?.length > 1) {
                // === Dropdown Range ===

                const formKey = item.split("_")[0];

                if (item.split("_")[1] == "startDate") {
                  fullData[formKey] = {
                    ...(fullData[formKey] || {}),
                    startDate: fieldValue,
                  };
                } else if (item.split("_")[1] == "endDate") {
                  fullData[formKey] = {
                    ...(fullData[formKey] || {}),
                    endDate: fieldValue,
                  };
                }
              } else {
                fullData[item] = fieldValue;
              }

              // === Validation ===

              if (formItem?.type == "chip-stack") {
                if (formItem?.tags?.useCheckbox?.required) {
                  // => checkbox cannot be all empty

                  const currentValue = fullData[item];

                  isValid = false;

                  if (currentValue?.length > 0) {
                    currentValue.forEach((val) => {
                      if (!isValid) {
                        isValid = _.has(val, "checked") && val?.checked == true;
                      }
                    });
                  }

                  if (!isValid) {
                    this.refFormik.setErrors({
                      [item]: getLabel({ name: "validateCheckbox" }),
                    });
                  }
                }
              }
            });

            // === Passing Data ===

            if (this.props.handleEvent && isValid) {
              this.props.handleEvent({
                type: "submit",
                data: this.refFormik.values,
                fullData,
              });
            }
          }
          break;

        case "prev-button":
          {
            if (this.props.handleEvent) {
              this.props.handleEvent({
                type: "prev-button",
                data: this.refFormik.values,
              });
            }
          }
          break;

        case "on-child-value-changed":
          {
            try {
              const { formKeys, formChildItem, formikValues, values } = params;

              const refactorFormNestedValue = this.updateFormNestedValue({
                currentFormNestedValue: this.state.formNestedValue,
                formKeys,
                formChildItem,
                formikValues,
                values,
              });

              this.setState({
                formNestedValue: refactorFormNestedValue,
              });
              if (this.props.getFormNestedValue) {
                this.props.getFormNestedValue(refactorFormNestedValue);
              }

              // try {

              //   if (
              //     onChangeValue
              //   ) {

              //     await onChangeValue({
              //       values: refactorFormNestedValue, // for function handle on child
              //       formikValues: formikValues, // for function handle on child
              //       formNested: this.state.formNested,
              //       formNestedValue: refactorFormNestedValue, // only for outer layer
              //     })

              //   }

              // }
              // catch (err) {

              // }
            } catch (err) {}
          }
          break;
      }

      try {
        if (
          onChangeValue &&
          params?.type != "on-child-value-changed"
          // && !Helpers.compareObject(this.state.formikValues, this.refFormik?.values)
        ) {
          await onChangeValue({
            values: formNestedValue, // for function handle on child
            formikValues: this.refFormik?.values, // for function handle on child
            formNested: formNested,
            formNestedValue: formNestedValue, // only for outer layer
          });

          this.setState({
            formikValues: this.refFormik?.values,
          });
        }
      } catch (err) {}
    } catch (err) {}
  }

  async initialize() {
    //=== Set Validation Schema ===
    //=== Set Initial Value ===

    try {
      const head = { ...(this.props.head || {}) };

      const propsInitialValues = Helpers.structuredClone(
        this.props.initialValues
      );

      const labelIsRequired = getLabel({ name: "isRequired" });
      const validationForm = {};
      const initialValues = {};
      const dataDropdown = {};
      let formNested = {};
      let formNestedValue = {};

      // =====================================================
      // ============= Start Looping for Head Form ===========
      // =====================================================

      Object.keys(head)?.forEach(async (form) => {
        const formItem = head[form];

        const injectValue =
          propsInitialValues && propsInitialValues[form]
            ? propsInitialValues[form]
            : null;

        // =====================================================
        // === Configure Validation Form & Initial Value =======
        // =====================================================

        switch (formItem?.type) {
          case "file":
            {
              if (formItem?.required) {
                validationForm[form] = yup
                  .mixed()
                  .required(
                    formItem?.required
                      ? locale(formItem?.label) + " " + labelIsRequired
                      : false
                  );
              }

              initialValues[form] = injectValue
                ? injectValue
                : formItem?.defaultValue || "";
            }
            break;

          case "string":
            {
              if (formItem?.required) {
                validationForm[form] = yup
                  .string(locale(formItem?.placeholder))
                  .required(
                    formItem?.required
                      ? locale(formItem?.label) + " " + labelIsRequired
                      : false
                  );
              }

              initialValues[form] = injectValue
                ? injectValue
                : formItem?.defaultValue || "";
            }
            break;

          case "email":
            {
              if (formItem?.required) {
                validationForm[form] = yup
                  .string()
                  .email("Invalid email")
                  .required(
                    formItem?.required
                      ? locale(formItem?.label) + " " + labelIsRequired
                      : false
                  );
              }

              initialValues[form] = injectValue
                ? injectValue
                : formItem?.defaultValue || "";
            }
            break;

          case "switch":
            {
              initialValues[form] = Boolean(
                injectValue ? injectValue : formItem?.defaultValue || ""
              );
            }
            break;

          case "number":
            {
              if (formItem?.required) {
                validationForm[form] = yup
                  .number(locale(formItem?.placeholder))
                  .required(
                    formItem?.required
                      ? locale(formItem?.label) + " " + labelIsRequired
                      : false
                  );
              }

              const fieldSchema = validationForm[form] || yup;

              if (formItem?.minNumber && fieldSchema) {
                validationForm[form] = fieldSchema
                  .number()
                  .min(
                    formItem?.minNumber,
                    "Min Number: " + formItem?.minNumber
                  );
              }

              if (formItem?.maxNumber && fieldSchema) {
                validationForm[form] = fieldSchema
                  .number()
                  .max(
                    formItem?.maxNumber,
                    "Max Number: " + formItem?.maxNumber
                  );
              }

              initialValues[form] = injectValue
                ? injectValue
                : formItem?.defaultValue || "";
            }
            break;

          case "date":
            {
              if (formItem?.required) {
                validationForm[form] = yup
                  .date(locale(formItem?.placeholder))
                  .required(
                    formItem?.required
                      ? locale(formItem?.label) + " " + labelIsRequired
                      : false
                  );
              }

              initialValues[form] = injectValue
                ? injectValue
                : formItem?.defaultValue || null;
            }
            break;

          case "date-range":
          case "date-picker-range-full":
          case "date-picker-range-uncontrolled":
            {
              if (formItem?.required?.startDate) {
                validationForm[form + "_startDate"] = yup
                  .date()
                  .typeError(getLabel({ name: "invalidDate" }))
                  .required(
                    formItem?.required.startDate
                      ? locale(formItem?.labels.startDate) +
                          " " +
                          labelIsRequired
                      : false
                  );
              } else {
                validationForm[form + "_startDate"] = yup
                  .date()
                  .typeError(getLabel({ name: "invalidDate" }));
              }

              if (formItem?.required?.endDate) {
                validationForm[form + "_endDate"] = yup
                  .date()
                  .typeError(getLabel({ name: "invalidDate" }))
                  .required(
                    formItem?.required.endDate
                      ? locale(formItem?.labels.endDate) + " " + labelIsRequired
                      : false
                  );
              } else {
                validationForm[form + "_endDate"] = yup
                  .date()
                  .typeError(getLabel({ name: "invalidDate" }));
              }

              initialValues[form + "_startDate"] =
                (propsInitialValues &&
                  propsInitialValues[form + "_startDate"]) ||
                formItem?.value ||
                null ||
                formItem?.defaultValue?.startDate;
              initialValues[form + "_endDate"] =
                (propsInitialValues && propsInitialValues[form + "_endDate"]) ||
                formItem?.value ||
                null ||
                formItem?.defaultValue?.endDate;
            }
            break;

          case "dropdown":
            {
              if (formItem?.multiple) {
                initialValues[form] = injectValue
                  ? injectValue
                  : formItem?.defaultValue || [];

                if (formItem?.required) {
                  validationForm[form] = yup
                    .array()
                    .of(yup.mixed())
                    .min(
                      1,
                      formItem?.required
                        ? locale(formItem?.label) + " " + labelIsRequired
                        : false
                    );
                }
              } else {
                initialValues[form] = injectValue
                  ? injectValue
                  : formItem?.defaultValue || "";

                if (formItem?.required) {
                  validationForm[form] = yup
                    .mixed(locale(formItem?.placeholder))
                    .required(
                      formItem?.required
                        ? locale(formItem?.label) + " " + labelIsRequired
                        : false
                    );
                }
              }

              dataDropdown[form] = formItem?.dropdown?.data || [];

              if (
                formItem?.useFirstIndexAsDefaultValue &&
                !initialValues[form]
              ) {
                initialValues[form] = formItem?.dropdown?.data[0]?.id;
              }
            }
            break;

          case "chip-stack":
            {
              switch (formItem?.itemType) {
                case "email":
                  {
                    validationForm[form] = yup
                      .array()
                      .of(yup.string().email("Invalid email"));
                  }
                  break;
              }

              initialValues[form] = injectValue
                ? injectValue
                : formItem?.defaultValue || [];
            }
            break;
        }

        // =====================================================
        // ================= On Edit Condition =================
        // =====================================================

        if (injectValue) {
          // === on edit ===

          if (formItem.disableOnEdit) {
            validationForm[form] = null;
          }
        }

        // =====================================================
        // ================= On Wired Dropdown =================
        // =====================================================

        if (formItem.requiredPrevField) {
          validationForm[form] = validationForm[form].test({
            name: formItem.requiredPrevField.id,
            exclusive: false,
            params: {},
            message: locale(head[form]?.requiredPrevField?.message),
            test: function (value) {
              // You can access the price field with `this.parent`.

              return this.refFormik?.values[formItem.requiredPrevField.id];
            },
          });
        }

        if (formItem?.updateNextField?.length > 0 && initialValues[form]) {
          try {
            formItem?.updateNextField.forEach((targetField) => {
              const itemNextField = head[targetField?.id];

              if (itemNextField?.type == "dropdown") {
                itemNextField["dropdown"]["data"] = [];
              }
            });

            async function setHead(i) {
              const itemNextField = head[formItem?.updateNextField[i]?.id];

              if (
                itemNextField["dropdown"] &&
                itemNextField["dropdown"]["data"]?.length == 0
              ) {
                // itemNextField['dropdown']['loading'] = true

                const fetchData = await itemNextField["dropdown"].getData({
                  id: initialValues[form],
                });

                dataDropdown[formItem?.updateNextField[i]?.id] = fetchData;

                itemNextField["dropdown"]["data"] = fetchData || [];
                itemNextField["elementKey"] = Helpers.randomNumber(100);
                // itemNextField['dropdown']['loading'] = false
              }
            }

            await Helpers.delayFunction({
              func: setHead,
              length: formItem?.updateNextField?.length,
              delay: 200,
            });
            await this.setState({
              head: { ...(head || {}) },
              dataDropdown,
            });
          } catch (err) {}
        }

        // =====================================================
        // ============== Nested From Initialize ===============
        // =====================================================

        if (formItem?.nested) {
          formNested[form] = Helpers.structuredClone(formItem?.nested);

          const initialValueFormNestedValue =
            FormGeneratorHelpers.getFormNestedValueFromHead(formItem);

          formNestedValue[form] = initialValueFormNestedValue;

          const idChild = _.uniqueId();

          const formNestedChild = formNested[form]["child"];

          if (formNestedChild?.length > 0) {
            // => default value from parent
          } else {
            const initialFirstChild =
              initialValues[form]?.child?.length > 0
                ? [...(initialValues[form]?.child || [])]
                : [];

            formNested[form]["child"] = initialFirstChild;
          }
        }
      });

      // =====================================================
      // ========== Put Validation Schema in Yup =============
      // =====================================================

      const validationSchema = yup.object(validationForm);

      this.setState({
        validationForm,
        validationSchema,
        head: { ...(head || {}) },
        initialValues: initialValues,
        dataDropdown,
        formNested,
        formNestedValue,
        triggerChildFormUpdated: true,
      });
      Helpers.sleep(500);
      this.setState({
        triggerChildFormUpdated: false,
      });
      this.updateValidation();
    } catch (err) {}
  }

  async componentDidMount() {
    await this.initialize();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (
      !Helpers.compareObject(prevProps.head, this.props.head) ||
      !Helpers.compareObject(this.props.initialValues, prevProps.initialValues)
    ) {
      await this.initialize();
    }
    // if (
    //   !Helpers.compareObject(prevState.formNestedValue, this.state.formNestedValue)
    //   ) {

    //   if (this.props.getFormNestedValue) {
    //     this.props.getFormNestedValue(this.state.formNestedValue)
    //   }

    // }
  }

  render() {
    const {
      state: {
        mainClassName,
        validationSchema,
        initialValues,
        head,
        disableSubmit,
        dataDropdown,
        formNested,
        formNestedValue,
        triggerChildFormUpdated,
      },
      props: {
        title,
        buttonSubmit,
        disableStrictEdit,
        full,
        hideButtonSubmit,
        prevButton,
        isNestedChild,
        fieldClass,
        className,
        header,
        titleAttribute,
        onlyView,
        id,
      },
    } = this;

    const forms = Object.keys(head || {});

    if (this.props.refFormGenerator) {
      this.props.refFormGenerator(this);
    }

    return (
      <>
        {head ? (
          <Stack
            className={mainClassName + " " + (className || "")}
            spacing={2}
            sx={{ width: full ? "100%" : 500 }}
          >
            {(title || header) && (
              <Stack
                className={mainClassName + "-header"}
                direction={"row"}
                justifyContent={"space-between"}
              >
                {title && (
                  <Stack>
                    <Typography
                      variant="h5"
                      gutterBottom
                      level="title-md"
                      {...(titleAttribute || {})}
                    >
                      {locale(title)}
                    </Typography>
                  </Stack>
                )}
                {!onlyView && header?.action && (
                  <Stack direction={"row"} spacing={1}>
                    {header?.action?.button && (
                      <Button {...(header?.action?.button || {})} />
                    )}
                    {header?.action?.iconButton && (
                      <IconButton {...(header?.action?.iconButton || {})} />
                    )}
                  </Stack>
                )}
              </Stack>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              enableReinitialize
            >
              {(formik) => {
                this.refFormik = formik;
                const isButtonSubmitDisabled = disableStrictEdit
                  ? !formik.isValid
                  : !formik.isValid ||
                    Helpers.compareObject(formik.values, initialValues);

                return (
                  <form onSubmit={formik.handleSubmit}>
                    <Stack
                      spacing={fieldClass ? 0 : 4}
                      className={fieldClass || ""}
                    >
                      {forms?.length > 0 &&
                        forms.map((formKeys, formIndex) => {
                          const formItem = head[formKeys];

                          const formNestedItem = formNested[formKeys];

                          const formChild = formNestedItem?.child;

                          return (
                            <>
                              <Fields
                                key={
                                  mainClassName +
                                  "-fields-" +
                                  formIndex +
                                  (triggerChildFormUpdated ? _.uniqueId() : "")
                                }
                                formItem={formItem}
                                formKeys={formKeys}
                                formIndex={formIndex}
                                onlyView={onlyView}
                                formik={formik}
                                handleEvent={this.handleEvent.bind(this)}
                                convertDateRangeName={this.convertDateRangeName.bind(
                                  this
                                )}
                              />
                              {formChild?.length > 0 && (
                                <>
                                  {formChild.map(
                                    (formChildItem, formChildIndex) => {
                                      const addressIndex =
                                        formIndex + "=" + formChildIndex;
                                      const formChildForms =
                                        formChildItem?.forms;
                                      const nestedAttribute =
                                        Helpers.filterObjectByKey(
                                          formNestedItem,
                                          ["forms"]
                                        );

                                      const childInitialValue =
                                        triggerChildFormUpdated &&
                                        FormGeneratorHelpers.getNestedValue({
                                          formNestedValue,
                                          formKeys,
                                          formChildItem,
                                        });

                                      const useNumber =
                                        formNestedItem?.useNumber;
                                      const useTitle = nestedAttribute?.title;

                                      const showDeleteButton = !useTitle;
                                      const showDeleteButtonOnHeader = useTitle;

                                      const formChildTitle =
                                        formNestedItem?.title &&
                                        locale(formNestedItem?.title) +
                                          (useNumber
                                            ? " " + (formChildIndex + 1)
                                            : "");

                                      if (
                                        Object.keys(formChildForms || {})
                                          ?.length > 0
                                      ) {
                                        return (
                                          <Stack
                                            key={
                                              mainClassName +
                                              "-fields-nested-" +
                                              addressIndex
                                            }
                                            direction={
                                              useNumber ? "row" : "column"
                                            }
                                            spacing={1}
                                            alignItems={"center"}
                                          >
                                            {!useTitle && useNumber && (
                                              <Typography>
                                                {formChildIndex + 1 + ". "}
                                              </Typography>
                                            )}

                                            <FormGenerator
                                              key={
                                                mainClassName +
                                                "-form-child-" +
                                                formNestedItem?.id
                                              }
                                              id={
                                                (id ? id + "-" : "") +
                                                formChildItem?.id
                                              }
                                              head={formChildForms}
                                              onlyView={onlyView}
                                              className={
                                                formNestedItem?.formClass
                                              }
                                              isNestedChild={true}
                                              refFormGenerator={(instance) => {
                                                this.refFormChild = instance;
                                              }}
                                              getFormNestedValue={(value) => {
                                                try {
                                                  if (_.has(value, formKeys)) {
                                                    let newFormNestedValue = {
                                                      ...(formNestedValue ||
                                                        {}),
                                                      [formKeys]:
                                                        value[formKeys],
                                                    };
                                                    let refactorFormNested =
                                                      this.updateFormNestedValue(
                                                        {
                                                          currentFormNestedValue:
                                                            formNestedValue,
                                                          formKeys,
                                                          formChildItem,
                                                          formikValues:
                                                            formik?.values,
                                                          values: value,
                                                        }
                                                      );

                                                    if (
                                                      this.props
                                                        .getFormNestedValue
                                                    ) {
                                                      this.props.getFormNestedValue(
                                                        refactorFormNested
                                                      );
                                                    }
                                                  }
                                                } catch (err) {}
                                              }}
                                              onChangeValue={async (value) => {
                                                await this.handleEvent({
                                                  type: "on-child-value-changed",
                                                  formKeys,
                                                  formChildItem,
                                                  formChildIndex,
                                                  formNestedItem,
                                                  ...(value || {}),
                                                });
                                              }}
                                              header={
                                                !onlyView &&
                                                showDeleteButtonOnHeader && {
                                                  action: {
                                                    iconButton: {
                                                      icon: {
                                                        name: "DeleteOutline",
                                                      },
                                                      handleClick:
                                                        this.handleEvent.bind(
                                                          this,
                                                          {
                                                            type: "delete-child",
                                                            formKeys,
                                                            formChildItem,
                                                            formChildIndex,
                                                          }
                                                        ),
                                                    },
                                                  },
                                                }
                                              }
                                              {...(nestedAttribute || {})}
                                              title={formChildTitle}
                                              initialValues={childInitialValue}
                                            />

                                            {!onlyView && showDeleteButton && (
                                              <IconButton
                                                icon={{
                                                  name: "DeleteOutline",
                                                }}
                                                handleClick={this.handleEvent.bind(
                                                  this,
                                                  {
                                                    type: "delete-child",
                                                    formKeys,
                                                    formChildItem,
                                                    formChildIndex,
                                                  }
                                                )}
                                              />
                                            )}
                                          </Stack>
                                        );
                                      }
                                    }
                                  )}
                                </>
                              )}
                              {!onlyView && formNestedItem && (
                                <Button
                                  headType={"add"}
                                  theme="secondary"
                                  handleClick={this.handleEvent.bind(this, {
                                    type: "add-child",
                                    formKeys,
                                    length: formChild?.length,
                                    formNestedItem,
                                  })}
                                  label={formNestedItem?.addButton?.label}
                                />
                              )}
                            </>
                          );
                        })}
                      {!onlyView && !hideButtonSubmit && (
                        <Stack
                          className={mainClassName + "-wrap-button"}
                          spacing={1}
                          direction={"row"}
                        >
                          {prevButton && (
                            <Button
                              label={
                                prevButton?.label || getLabel({ name: "prev" })
                              }
                              handleClick={() =>
                                this.handleEvent({
                                  type: "prev-button",
                                  values: formik?.values,
                                })
                              }
                              theme="secondary"
                            />
                          )}
                          {!isNestedChild && (
                            <Button
                              type="submit"
                              label={
                                buttonSubmit?.label ||
                                getLabel({ name: "submit" })
                              }
                              disabled={isButtonSubmitDisabled}
                              handleClick={() =>
                                this.handleEvent({
                                  type: "submit",
                                  values: formik?.values,
                                })
                              }
                            />
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </form>
                );
              }}
            </Formik>
          </Stack>
        ) : (
          <Skeleton row={3} />
        )}
      </>
    );
  }
}
export default connect(null, { assignMainLayout })(FormGenerator);
