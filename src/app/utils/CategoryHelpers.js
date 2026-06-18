import { getDataHead } from "@/app/data/head";
import { Auth } from "@/app/data/local";
import _ from "lodash";
import { Config } from "../constant";
import { locale } from "../data/locale";

function refactorNestedObject(data = {}, detail = {}) {
  const dataCategories = [];

  let result = [];

  result = Object.keys(data)?.map((key, index) => {
    const item = data[key];

    const address = {
      ...(detail.address || {}),
      [detail?.level + 1]: key,
    };

    dataCategories.push({
      addressId: (detail?.addressId || key) + "=" + key,
      level: detail?.level + 1,
      label:
        key + "" + (typeof item == "string" ? " " + item : "" + locale(item)),
      address: address,
      parentLabel: detail?.parentLabel || "",
    });

    if (
      _.isObject(item) &&
      Object.keys(data)?.length > 0 &&
      !(_.has(item, "en") || _.has(item, "zh"))
    ) {
      const level = detail?.level + 1;

      const resultChild = refactorNestedObject(item, {
        addressId: (detail?.addressId || key) + "=" + key,
        address: address,
        parentLabel: key,
        level: level,
      });

      if (level == 1) {
        const refactorParent = {
          id: key,
          label: resultChild?.result[0].label,
          child: resultChild?.result,
        };

        refactorParent.child = refactorParent.child.slice(
          0,
          refactorParent.child.length,
        );

        return refactorParent;
      } else {
        return {
          id: key,
          label: key,
          child: resultChild?.result,
        };
      }
    } else {
      return {
        id: key,
        label: key + " " + locale(item),
      };
    }
  });

  return {
    result,
    dataCategories,
  };
}

function getRefactorCategory(year, level = 0) {
  try {
    const headCategories = getDataHead({
      name: "headCategories",
    });

    const { result, dataCategories } = refactorNestedObject(
      headCategories[year || Config.userYear],
      {
        level: level,
      },
    );

    const refactorCategory = result.map((item) => {
      const child = item?.child || [];
      child.splice(0, 1);
      return {
        ...item,
        child: child,
      };
    });

    return refactorCategory;
  } catch (err) {}
}

const CategoryHelpers = {
  refactorNestedObject,
  getRefactorCategory,
};

export default CategoryHelpers;
