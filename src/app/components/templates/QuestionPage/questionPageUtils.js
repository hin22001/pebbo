import dayjs from "dayjs";
import { headCategories } from "@/src/app/data/head/global";
import { Config } from "@/src/app/constant";

/**
 * Pure utility functions extracted from QuestionPage.
 * No `this` or component state — pass all needed data as arguments.
 */

export function getAccuracyGif(percentage) {
  const rounded = roundScore(percentage);
  if (rounded === 0) {
    return "/images/animation/0__number.gif";
  }
  return `/images/animation/${rounded}.gif`;
}

export function getCharacterName(percentage) {
  const rounded = roundScore(percentage);
  if (rounded >= 80) {
    return "Bobby"; // 100.gif, 80.gif
  } else if (rounded >= 60) {
    return "Bobby"; // 60.gif
  } else if (rounded >= 40) {
    return "Potter"; // 40.gif
  } else {
    return "Bobby"; // 20.gif, 0.gif
  }
}

export function roundScore(percentage) {
  const score = percentage || 0;
  const roundedValues = [0, 20, 40, 60, 80, 100];
  let nearest = roundedValues[0];
  let minDiff = Math.abs(score - nearest);

  for (let i = 1; i < roundedValues.length; i++) {
    const diff = Math.abs(score - roundedValues[i]);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = roundedValues[i];
    }
  }
  return nearest;
}

export function getDifficultyLabel(value) {
  const numeric = Number(value);
  const mapping = {
    1: "easy",
    2: "normal",
    3: "hard",
    4: "challenging",
    5: "very challenging",
  };
  return mapping[numeric] || value;
}

export function getCategoryLabel(outerCategory, dataCategory) {
  try {
    if (dataCategory && Array.isArray(dataCategory)) {
      const foundCategory = dataCategory.find(
        (cat) => cat?.id == outerCategory || cat?.id === outerCategory,
      );
      if (foundCategory?.label) {
        return foundCategory.label;
      }
    }

    const year = Config.userYear || 1;
    const yearData = headCategories?.[year] || {};
    const constructedKey = `${year}.${outerCategory}`;

    for (const sectionId of Object.keys(yearData)) {
      const section = yearData[sectionId];
      if (!section) continue;

      if (Object.prototype.hasOwnProperty.call(section, constructedKey)) {
        const val = section[constructedKey];
        if (val && typeof val === "object" && (val.en || val.zh)) {
          const text = val.en || val.zh || "";
          return `${constructedKey} ${text}`.trim();
        }
        if (typeof val === "string") {
          return `${constructedKey} ${val}`.trim();
        }
      }

      const outerKey = String(outerCategory);
      if (Object.prototype.hasOwnProperty.call(section, outerKey)) {
        const val = section[outerKey];
        if (val && typeof val === "object" && (val.en || val.zh)) {
          const text = val.en || val.zh || "";
          return `${outerKey} ${text}`.trim();
        }
        if (typeof val === "string") {
          return `${outerKey} ${val}`.trim();
        }
      }
    }

    return constructedKey;
  } catch (e) {
    return String(outerCategory);
  }
}

export function formatTime(totalSeconds) {
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0",
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function formatStartEndTime(time) {
  if (time > 0) {
    const hours = String(time?.getHours()).padStart(2, "0");
    const minutes = String(time?.getMinutes()).padStart(2, "0");
    return {
      hours: hours?.split(""),
      minutes: minutes?.split(""),
    };
  }
  return {
    hours: "??",
    minutes: "??",
  };
}

export function getTimeDuration(dataTime, lastQuestion) {
  try {
    const newDataTime = dataTime?.map((item) => {
      let duration = 0;

      if (item?.timeEnd?.diff) {
        duration = item?.timeEnd.diff(item?.timeStart, "seconds");
      }

      if (item?.id == lastQuestion) {
        duration = dayjs().diff(item?.timeStart, "seconds") || 0;
      }

      return {
        ...item,
        duration,
      };
    });

    return newDataTime;
  } catch (err) {
    return dataTime;
  }
}

export function getCategoryEmoji(category) {
  const emojiList = [
    "📐",
    "🔢",
    "📝",
    "📏",
    "➕",
    "➖",
    "➗",
    "✖️",
    "🔢",
    "📊",
    "🧮",
    "📈",
    "💵",
    "📚",
    "📖",
    "✏️",
  ];
  const index = category?.id || 0;
  return emojiList[index % emojiList.length];
}
