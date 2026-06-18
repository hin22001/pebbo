import { Config } from "@/app/constant";
import LabelEn from "./en/Label";
import LabelZh from "./zh/Label";
import { Helpers } from "@/app/utils";
import Language from "../local/Language";

function replaceVariableStringToValue(string = "", value) {
  try {
    let result = string;

    const variables = Array.from(result?.matchAll(/{(.*?)}/g), (x) => x[1]);

    if (variables?.length > 0 && value) {
      variables.forEach((item) => {
        result = result.replace(
          "{" + item + "}",
          Object.keys(value || {})?.length > 0 ? value[item] : "",
        );
      });
    }

    return result;
  } catch (err) {
    return string;
  }
}

export function getLabel(params) {
  try {
    // =========================================
    // ================ GET LANG ===============
    // =========================================

    let Router = { locale: "id" };

    const lang = params?.lang || Helpers.getCurrentLanguage();

    // =========================================
    // ============== Get Label  ===============
    // =========================================

    let result = LabelEn;

    switch (lang) {
      case "en":
        {
          result = LabelEn;
        }
        break;

      case "zh":
        {
          result = LabelZh;
        }
        break;
    }

    if (params?.name) {
      result = result[params.name] || "";
    }

    // ==================================
    // ========= Return Result ==========
    // ==================================

    const refactorResult = params?.value
      ? replaceVariableStringToValue(result, params?.value)
      : result || "";

    return refactorResult;
  } catch (err) {
    return "";
  }
}

export function locale(label, value) {
  try {
    if (label) {
      let Router = { locale: Config.defaultLanguage };

      const lang =
        Language.getLanguage() ||
        (typeof window !== "undefined" ? localStorage.getItem("lang") : null) ||
        Config.defaultLanguage;

      if (typeof label == "object" && Object.keys(label)?.length > 0) {
        // ==================================
        // ========= Return Result ==========
        // ==================================

        const refactorResult = value
          ? replaceVariableStringToValue(label[lang], value)
          : label[lang] || "";

        return refactorResult;
      } else {
        const refactorResult = value
          ? replaceVariableStringToValue(label, value)
          : label || "";

        return refactorResult;
      }
    } else {
      return "";
    }
  } catch (err) {
    return label || "";
  }
}
