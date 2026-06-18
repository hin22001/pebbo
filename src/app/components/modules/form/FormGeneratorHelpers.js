import _ from "lodash";

function getNestedValue(params) {
  try {
    const { formNestedValue, formKeys, formChildItem } = params;

    let result = {};

    if (_.has(formNestedValue, formKeys)) {
      // exist

      if (_.has(formNestedValue[formKeys], "child")) {
        // child exist

        if (Array.isArray(formNestedValue[formKeys]["child"])) {
          if (formNestedValue[formKeys]["child"]?.length > 0) {
            const foundIndex = formNestedValue[formKeys]["child"].findIndex(
              (item) => item.id == formChildItem?.id,
            );

            if (foundIndex >= 0) {
              result = formNestedValue[formKeys]["child"][foundIndex]["value"];
            }
          } else {
            result = formNestedValue[formKeys]["value"];
          }
        }
      } else {
        result = formNestedValue[formKeys]["value"];
      }
    } else {
    }

    return result;
  } catch (err) {
    return null;
  }
}

function getFormNestedValueFromHead(formItem) {
  try {
    let result = {};

    // ========== Check Direct Value ==========

    if (_.has(formItem, "defaultValue") || _.has(formItem, "value")) {
      result["value"] = formItem?.defaultValue || formItem?.value || "";
    }

    // ========== Check Forms Value ==========

    if (_.has(formItem, "forms") && Object.keys(formItem.forms)?.length > 0) {
      const formsValue = {};

      Object.keys(formItem.forms).forEach((formKey) => {
        const fieldItem = formItem.forms[formKey];

        let fieldItemValue = fieldItem?.defaultValue || fieldItem?.value;

        if (fieldItem?.nested?.child?.length > 0) {
          fieldItemValue = getFormNestedValueFromHead(fieldItem);
        }

        formsValue[formKey] = fieldItemValue;
      });

      result["value"] = formsValue;
    }

    // ========== Check Nested Child ==========

    if (_.has(formItem, "nested") && formItem?.nested?.child?.length > 0) {
      const formItemNestedChild = formItem?.nested?.child?.map(
        (item, index) => {
          const childValue = getFormNestedValueFromHead(item);

          const nestedValue = {
            id: item?.id || _.uniqueId(),
            ...childValue,
          };

          return nestedValue;
        },
      );

      result["child"] = formItemNestedChild;
    }

    return result;
  } catch (err) {}
}

const FormGeneratorHelpers = {
  getFormNestedValueFromHead,
  getNestedValue,
};

export default FormGeneratorHelpers;
