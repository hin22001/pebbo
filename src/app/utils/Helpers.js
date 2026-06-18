import _ from "lodash";
import sha512 from "crypto-js/sha512";
import axios from "axios";
import moment from "moment";
import dayjs from "dayjs";
import { Language } from "@/src/app/data/local";
import { Config } from "@/src/app/constant";

function encryption(value) {
  let string = value;

  if (typeof value != "string") {
    string = value.toString();
  }

  const result = sha512(sha512(string).toString()).toString();
  return result;
}

function formatDateDefault({ value, format = "LL" }) {
  try {
    if (value) {
      let result = value;
      const lang = getCurrentLanguage();

      result = dayjs(value)?.locale(lang)?.format(format);

      return result;
    } else {
      return value;
    }
  } catch (err) {
    return value;
  }
}

function generateDate(date, type = null, locale = null, monthType = null) {
  try {
    if (!date) return date;

    const RouterLocale =
      typeof window !== "undefined" ? localStorage?.getItem("lang") : null;

    locale = RouterLocale || "id";
    monthType = monthType || "long";

    let currentDate = new Date(date);
    let day = currentDate.getDate();
    let month = currentDate.toLocaleString(locale, { month: monthType });
    let year = currentDate.getFullYear();

    if (type == "day") {
      let weekday = new Date(date).toLocaleDateString(locale, {
        weekday: "long",
      });

      return `${weekday}, ${day} ${month} ${year}`;
    } else if (type == "dayShort") {
      let weekday = new Date(date).toLocaleDateString(locale, {
        weekday: "short",
      });

      return `${weekday}, ${day} ${month} ${year}`;
    } else {
      return `${day} ${month} ${year}`;
    }
  } catch (err) {
    return date;
  }
}

function generateDaysOfDate(date) {
  if (!date) return date;

  const listMonth = [
    "",
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  var listDays = [
    "",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];

  let splitDate = date.split("-");
  let daysName = listDays[new Date(date).getDay()];
  let day = splitDate[2];

  let month = listMonth[Number(splitDate[1])];
  let year = splitDate[0];

  return `${daysName}, ${day} ${month} ${year}`;
}

function generateMonth(month, lang = "id") {
  let listMonth = [];
  let label = "";
  let finalString = "";

  if (lang == "id") {
    label = "Bulan";

    listMonth = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    finalString = label + " " + listMonth[month];
  } else if (lang == "en") {
    label = "";

    listMonth = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    finalString = listMonth[month];
  }

  return finalString;
}

function getDateValueFromSlashFormat(value, type = "month") {
  // 30/01/2001
  try {
    const routerLocale =
      typeof window !== "undefined"
        ? localStorage?.getItem("lang") || "id"
        : "id";
    let result;

    switch (type) {
      case "month":
        {
          const monthNumber = parseInt(value.split("/")[1] || 0);

          const formatValue = new Date(
            new Date().setMonth(
              monthNumber < 13 ? monthNumber - 1 : monthNumber - 12,
            ),
          ).toLocaleString(routerLocale, { month: "long" });

          result = formatValue;
        }
        break;
    }

    return result;
  } catch (err) {
    return null;
  }
}

function getWeekOfMonth(value) {
  try {
    const moment = require("moment");

    const refactorValue = value || moment();

    const firstDayOfMonth = refactorValue.clone().startOf("month");
    const firstDayOfWeek = firstDayOfMonth.clone().startOf("week");

    const offset = firstDayOfMonth.diff(firstDayOfWeek, "days");

    return Math.ceil((refactorValue.date() + offset) / 7);
  } catch (err) {}
}

function sleep(delay = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
  // await Helpers.sleep(1e3); // how to use
}
function formatDate_yyyymmdd(date) {
  if (date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  } else {
    return "";
  }
}
function formatDate_ddmmyyyy(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [day, month, year].join("-");
}

function randomNumber(max) {
  return Math.floor(Math.random() * max + 1);
}

function formatTimeNow_hhmmss(divider = ":") {
  try {
    function checkTime(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }

    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers<10
    m = checkTime(m);
    s = checkTime(s);
    return h + divider + m + divider + s;
  } catch (err) {}
}

function extractEffectiveDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

function delayFunction(params = {}) {
  return new Promise(async (resolve, reject) => {
    await loopFunctionOnDelay({
      ...params,
      resolve,
      reject,
    });
  });
}

async function loopFunctionOnDelay({
  func,
  length,
  delay = 500,
  resolve,
  reject,
  _this,
}) {
  // === Will Return Resolve / Reject ===

  try {
    if (typeof func == "function" && length) {
      if (length == 1) {
        await func(0, _this);
        return resolve(1);
      } else {
        var i = 0; //  set your counter to 1

        async function loop() {
          //  create a loop function
          setTimeout(async function () {
            //  call a 3s setTimeout when the loop is called

            i++; //  increment the counter

            if (i < length) {
              await func(i - 1, _this);
              //  if the counter < 10, call the loop function
              loop(); //  ..  again which will trigger another
            } //  ..  setTimeout()
            else {
              await func(i - 1, _this);
              return resolve(i - 1);
            }
          }, delay);
        }

        return loop();
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

function getRangeDate(start, end) {
  if (typeof start == "string") {
    start = new Date(start);
  }
  if (typeof end == "string") {
    end = new Date(end);
  }
  for (
    var arr = [], dt = new Date(start);
    dt <= end;
    dt.setDate(dt.getDate() + 1)
  ) {
    arr.push(new Date(dt));
  }
  return arr;
}

function replaceString(sentence, keyword, replaceWith) {
  RegExp.quote = function (str) {
    return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
  };

  var regex = new RegExp(RegExp.quote(keyword), "gi");
  let result = sentence.replace(regex, replaceWith);

  return result;
}

function addMarkOnString(sentence, keyword) {
  try {
    if (sentence) {
      var regExp = new RegExp(keyword, "gi");
      let result = sentence.replace(regExp, "<mark>$&</mark>");

      return result;
    }
  } catch (err) {
    console.log(
      "🚀 ~ file: Helpers.js ~ line 154 ~ addMarkOnString ~ err",
      err,
    );
  }
}

function removeMarkOnString(sentence) {
  try {
    if (sentence) {
      var regExp = new RegExp("<mark>|</mark>", "gi");
      let result = sentence.replace(regExp, "");

      return result;
    }
  } catch (err) {
    console.log(
      "🚀 ~ file: Helpers.js ~ line 154 ~ removeMarkOnString ~ err",
      err,
    );
  }
}

function markStringByKeyword(sentence, keyword) {
  try {
    let string = sentence.toString();
    let key = keyword.toString();
    return string.toLowerCase().includes(key.toLowerCase()) && key !== ""
      ? addMarkOnString(string, key)
      : removeMarkOnString(string);
  } catch (err) {
    return sentence;
  }
}

function filterDataByKeyword(data, keyword, property = "name") {
  try {
    return data.filter((item) =>
      keyword
        ? item[property].toLowerCase().includes(keyword.toLowerCase())
        : true,
    );
  } catch (err) {
    return data;
  }
}

function combineArrayOfObject(arr1, arr2) {
  if (arr1.length == arr2.length) {
    let joinArray = arr1.map((item, index) =>
      Object.assign({
        ...item,
        ...arr2[index],
      }),
    );
    return joinArray;
  } else {
    return null;
  }
}

function getUniqueFromArrayOfObjectbyId(data) {
  let output = [];
  if (data && data.length > 0) {
    data.forEach(function (item) {
      var i = output.findIndex((x) => x.id == item.id);
      if (i <= -1) {
        output.push(item);
      }
    });
  }
  return output;
}

function removeArrayOfObjectbyId(data, id) {
  let foundIndex = data.findIndex((item) => item.id == id);
  data.splice(foundIndex, 1);
  return data;
}

function isURL(url) {
  let output = false;
  fetch(url)
    .then((res) => {
      if (res.status == 404) {
        output = true;
      }
    })
    .catch((err) => {});
  return output;
}

function secondToMinute(num) {
  return parseFloat(num / 60).toFixed(0);
}

function minuteToSecond(num) {
  return parseFloat(num).toFixed(0) * 60;
}

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function intersectArray(paramArr1, paramArr2, type = "in") {
  try {
    const arr1 = paramArr1 || [];
    const arr2 = paramArr2 || [];

    if (type == "in") {
      return arr1.filter((value) => arr2.includes(value));
    } else if (type == "out") {
      return arr1.filter((value) => !arr2.includes(value));
    }
  } catch (err) {
    return [];
  }
}

function isArrayEqual(arr1, arr2) {
  try {
    return _.isEqual(_.sortBy(arr1), _.sortBy(arr2));
  } catch (err) {}
}

function pushURLWithoutReload(params) {
  try {
    const Router = params?.Router;
    const URL = params?.URL;
    const useReplace = params?.useReplace;

    const config = {
      // pathname: Router.router.pathname,
      pathname: URL,
    };

    if (useReplace) {
      Router.replace(config, undefined, { shallow: true });
    } else {
      Router.push(config, undefined, { shallow: true });
    }
  } catch (err) {}
}

function changeSlugWithoutReload(
  Router,
  id,
  query = "slug",
  useReplace = true,
) {
  try {
    const config = {
      pathname: Router.router.pathname,
      query: {
        ...Router.router.query,
        [query]: id,
      },
    };

    if (useReplace) {
      Router.replace(config, undefined, { shallow: true });
    } else {
      Router.push(config, undefined, { shallow: true });
    }
  } catch (err) {}
}

function changeQueriesWithoutReload(Router, queries, useReplace) {
  try {
    const config = {
      pathname: Router.router.pathname,
      query: queries,
    };

    if (useReplace) {
      Router.replace(config, undefined, { shallow: true });
    } else {
      Router.push(config, undefined, { shallow: true });
    }
  } catch (err) {}
}

function hrefLocale(href = "") {
  try {
    if (href) {
      let lang = getCurrentLanguage();
      let hrefString = href.charAt(0) != "/" ? "/" + href : href;

      // If current language is default, don't prepend
      if (lang === Config.defaultLanguage) {
        // Also check if href already starts with default locale and remove it
        const pathParts = hrefString.split("/");
        if (pathParts[1] === Config.defaultLanguage) {
          return "/" + pathParts.slice(2).join("/");
        }
        return hrefString;
      }

      let langString = "/" + lang;
      let result = langString + hrefString;

      try {
        const firstPath = hrefString.split("/")[1];

        if (Config?.localeList?.includes(firstPath)) {
          result = hrefString;
        } else {
          result = langString + hrefString;
        }
      } catch (err) {}

      return result;
    }

    return "";
  } catch (err) {
    return "";
  }
}

function changeRouter(url, type = "push") {
  try {
    const RouterPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const lang = getCurrentLanguage();
    let refactorURL = url;

    try {
      const firstPath = url.split("/")[0];

      if (Config?.localeList?.includes(firstPath)) {
        refactorURL = url;
      } else {
        refactorURL = hrefLocale(url);
      }
    } catch (err) {}

    if (type == "push") {
      // => history recorded
      if (typeof window !== "undefined") {
        try {
          const Router =
            require("next/router")?.default || require("next/router");
          Router.push(refactorURL, refactorURL, {
            locale: lang,
          });
        } catch (err) {
          window.location.href = refactorURL;
        }
      }
    }

    if (type == "replace") {
      // => no history recorded
      if (typeof window !== "undefined") {
        try {
          const Router =
            require("next/router")?.default || require("next/router");
          Router.replace(refactorURL, refactorURL, {
            locale: lang,
          });
        } catch (err) {
          window.location.replace(refactorURL);
        }
      }
    }
  } catch (err) {}
}

function isPropertyEmpty(
  arrOfObject,
  propertyName = "name",
  propertyType = "string",
) {
  let isValid = true;

  arrOfObject.map((item) => {
    if (item[propertyName] === "") {
      isValid = false;
    }
  });

  return !isValid;
}

function isPropertyFilledOne(
  arrOfObject,
  propertyName = "name",
  propertyType = "string",
) {
  let isValid = false;

  arrOfObject.map((item) => {
    if (item[propertyName] !== "") {
      isValid = true;
    }
  });

  return isValid;
}

function downloadBlob(blob, fileName, directData) {
  // Create blob link to download
  const url = window?.URL?.createObjectURL(directData || new Blob([blob]));
  const link = document?.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();

  // Clean up and remove the link
  link.parentNode.removeChild(link);
}

async function fetchContentType(fileURL) {
  try {
    return (
      new axios({
        method: "GET",
        url: fileURL,
      })
        // return fetch(fileURL)

        .then(async (response) => {
          // const contentType = await response.headers.get('content-type')
          const contentType = await response.headers["content-type"];

          return contentType;
        })
        .catch((error) => {
          // console.error('Error:', error);
          return null;
        })
    );
  } catch (err) {
    console.log(
      "🚀 ~ file: Helpers.js ~ line 1319 ~ fetchContentType ~ err",
      err,
    );

    return null;
  }
}

function generateFormatTime(date) {
  try {
    var formatteddatestr = moment(date).format("hh:mm:ss");
    return formatteddatestr;
  } catch (err) {}
}

function getImagesFromHtml(string) {
  const imgRex = /<img.*?src="(.*?)"[^>]+>/g;
  const images = [];
  let img;
  while ((img = imgRex.exec(string))) {
    images.push(img[1]);
  }
  return images;
}

function time_convert(value, format = "hh:mm:ss") {
  try {
    function defaultReturn() {
      switch (format) {
        case "hh:mm:ss":
          {
            return "00:00:00";
          }
          break;

        case "mm:ss":
          {
            return "00:00";
          }
          break;
      }
    }

    if (value) {
      let second = parseInt(value);

      var minutes = Math.floor(second / 60);
      second = second % 60;

      var hours = Math.floor(minutes / 60);
      minutes = minutes % 60;

      function pad(num) {
        return ("0" + num).slice(-2);
      }

      switch (format) {
        case "hh:mm:ss":
          {
            let result = `${pad(hours)}:${pad(minutes)}:${pad(second)}`;

            return result;
          }
          break;

        case "mm:ss":
          {
            let result;
            if (value >= 3600) {
              // => turn to hh:mm:ss

              result = `${pad(hours)}:${pad(minutes)}:${pad(second)}`;
            } else {
              result = `${pad(minutes)}:${pad(second)}`;
            }

            return result;
          }
          break;
      }
    } else {
      defaultReturn();
    }
  } catch (err) {
    defaultReturn();
  }
}

function validateEmail(email) {
  try {
    let re = /\S+@\S+\.\S+/;
    return re.test(email);
  } catch (err) {}
}

function convertNumberToLetter(number) {
  const letter = (number + 10).toString(36).toUpperCase();
  return letter;
}

function addStr(str, stringToAdd, index) {
  let result = `${str.substring(0, index)} ${stringToAdd} ${str.substring(index, str.length)}`;
  return result;
}

function secondsToHms(d, type = "full", locale = "id") {
  try {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor((d % 3600) % 60);

    let hour, minute, second;
    let _h, _m, _s;

    if (locale == "id") {
      hour = "jam";
      minute = "menit";
      second = "detik";

      _h = "j";
      _m = "m";
      _s = "d";
    } else {
      hour = "hour";
      minute = "minute";
      second = "second";

      _h = "h";
      _m = "m";
      _s = "s";
    }

    switch (type) {
      case "full":
        {
          const hDisplay =
            h > 0
              ? h +
                (h == 1
                  ? " " + hour + ", "
                  : " " + (locale != "id" ? "hours" : hour) + ", ")
              : "";
          const mDisplay =
            m > 0
              ? m +
                (m == 1
                  ? " " + minute + ", "
                  : " " + (locale != "id" ? "minutes" : minute) + ", ")
              : "";
          const sDisplay =
            s > 0
              ? s +
                (s == 1
                  ? " " + second + ""
                  : " " + (locale != "id" ? "seconds" : second) + "")
              : "";

          return hDisplay + mDisplay + sDisplay;
        }
        break;

      case "hm":
        {
          const hDisplay = h > 0 ? h + _h : "";
          const mDisplay = m > 0 ? m + _m : "";

          const arr = [hDisplay, mDisplay].filter((item) => item);

          return arr.join(" ");
        }
        break;
    }
  } catch (err) {
    return d;
  }
}

function calculateTimeLeft(date) {
  let dateline = new Date(date).getTime();
  let now = new Date().getTime();
  let distance = dateline - now;

  let result = "";

  if (distance > 0) {
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (days > 0) hours = days * 24 + hours;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    result = hours + ":" + minutes + ":" + seconds;
  } else {
    result = "00:00:00";
  }

  return result;
}

function structuredClone(data) {
  if (data) {
    return JSON.parse(JSON.stringify(data));
  } else {
    return data;
  }
}

function splitURLToName(url) {
  let res = url.split("/");
  return res[res.length - 1];
}

function refactorHead(data, head) {
  try {
    let stringData = JSON.stringify(data);

    Object.keys(head.headGlossary).forEach((item, index) => {
      stringData = replaceString(
        stringData,
        "#" + item + "#",
        head.headGlossary[item],
      );
    });
    Object.keys(head.headGlossaryEn).forEach((item, index) => {
      stringData = replaceString(
        stringData,
        "#" + item + "#",
        head.headGlossaryEn[item],
      );
    });

    return JSON.parse(stringData);
  } catch (err) {}
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function b64toBlob(dataURI, type = "image/jpeg") {
  try {
    var byteString = atob(dataURI.split(",")[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: type });
  } catch (err) {}
}

function parseQuery(queryString) {
  var query = {};
  var pairs = (
    queryString[0] === "?" ? queryString.substr(1) : queryString
  ).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}

async function recursiveLoop(params) {
  try {
    const tick = params?.tick || 2000;
    const func = params?.func;
    const limit = params?.limit;
    const threshold = params?.threshold;

    let loopId = 0;

    async function loop(params, paramLoopId, n = 0) {
      function stop() {
        if (loopId) {
          clearInterval(loopId);
          loopId = 0;
        }
      }

      const paramThreshold =
        (params?.hasOwnProperty("threshold") &&
          typeof params.threshold != "undefined") ||
        false
          ? params?.threshold?.localStorage &&
            JSON.parse(
              localStorage.getItem(params?.threshold?.localStorage) || "null",
            )
          : params?.threshold?.sessionStorage
            ? JSON.parse(
                sessionStorage.getItem(params?.threshold?.sessionStorage) ||
                  "null",
              )
            : true;

      const paramLimit =
        (params?.hasOwnProperty("limit") &&
          typeof params.limit != "undefined") ||
        false
          ? params.limit
          : true;

      if (paramThreshold) {
        if (paramLimit) {
          if (!loopId || loopId == paramLoopId) {
            loopId = await setTimeout(async () => {
              if (params.func && typeof params.func == "function") {
                await params.func();
              }

              await loop(params, loopId, n + 1);
            }, params.tick);
          }
        } else {
          stop();
        }
      } else {
        stop();
      }

      return stop;
    }

    const stop = await loop({
      tick: tick,
      func: func,
      limit: limit,
      threshold: threshold,
    });

    return stop;
  } catch (err) {}
}

function percentage(partialValue, totalValue) {
  return (100 * partialValue) / totalValue;
}

function hasClassName(classNames, name) {
  try {
    return classNames?.split(" ").includes(name);
  } catch (err) {
    return null;
  }
}

function groupObjectWithArrayFormat(data, key) {
  try {
    if (key) {
      return _(data)
        .groupBy(key)
        .map((item, itemKey) => ({
          [key]: itemKey,
          data: _.map(item),
        }))
        .value();
    } else {
      return data;
    }
  } catch (err) {
    return data;
  }
}

function compareObject(obj1, obj2) {
  try {
    return JSON.stringify(obj1 || {}) == JSON.stringify(obj2 || {});
  } catch (err) {
    return null;
  }
}

function addArray(obj1 = [], obj2 = []) {
  try {
    return _.uniq([...(obj1 || []), ...(obj2 || [])]);
  } catch (err) {
    return [];
  }
}

function difference(obj1, obj2) {
  try {
    return Object.keys(obj1).filter((k) => obj1[k] !== obj2[k]);
  } catch (err) {
    return [];
  }
}

function openSnackbar(params) {
  try {
    const {
      name, // head alert name
      message,
      variant,
      autoHideDuration,
    } = params;

    const { getDataHead } = require("@/app/data/head");
    const { locale } = require("@/app/data/locale");
    const notistack = require("notistack");

    const head = message
      ? {
          message,
          type: variant || "error",
        }
      : getDataHead({ name: "headAlert" })[name || "generalError"];

    notistack?.enqueueSnackbar(locale(head?.message), {
      variant: head?.type,
      autoHideDuration: autoHideDuration || 7000,
    });
  } catch (err) {}
}

function filterObjectByKey(object = {}, key) {
  try {
    return _.pickBy(object, (value, k) => {
      if (typeof key == "string") {
        return k != key;
      } else if (Array.isArray(key)) {
        return !key.includes(k);
      }
    });
  } catch (err) {
    return object;
  }
}

function getDescendantProp(obj = {}, desc) {
  try {
    var arr = desc.split(".");
    while (arr.length && (obj = obj[arr.shift()]));
    return obj;
  } catch (err) {
    return obj;
  }
}

function removeEmptyValue(obj) {
  try {
    return _.omitBy(obj, (v) => v === null || v === "" || v == []);
  } catch (err) {
    return obj;
  }
}

function currencyFormatter(value) {
  const lang =
    typeof window !== "undefined" && localStorage?.getItem("lang") == "id"
      ? "id-ID"
      : "en-US";

  const currencyFormatter = new Intl.NumberFormat(lang, {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return currencyFormatter.format(value || 0);
}

function isStringEqual(string1, string2) {
  return string1.toUpperCase() === string2.toUpperCase();
}

function formatDateISO(date, time, basic) {
  if (date) {
    if (basic && time) {
      let formatDate = new Date(date);
      formatDate.setUTCHours(time.hours, time.min, time.sec, time.ms);
      return formatDate.toISOString();
    } else {
      return dayjs(date).format("YYYY-MM-DDTHH:mm:ss") + "Z";
    }
  } else {
    return null;
  }
}

function objectToFormData(object) {
  try {
    const formData = new FormData();
    Object.keys(object).forEach((key) =>
      // formData[key] = object[key]
      formData.append(key, object[key]),
    );
    return formData;
  } catch (err) {
    return object;
  }
}

function getCurrentLanguage() {
  try {
    const RouterPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const lang =
      Language.getLanguage() ||
      (typeof window !== "undefined" ? localStorage?.getItem("lang") : null) ||
      Config.defaultLanguage;
    return lang;
  } catch (err) {
    console.log(
      "🚀 ~ file: Helpers.ts ~ line 913 ~ getCurrentLanguage ~ err",
      err,
    );
    return Config.defaultLanguage;
  }
}

function parseStringObject(data) {
  try {
    let result = data;

    if (typeof data == "string") {
      result = JSON.parse(data);

      if (typeof result == "string") {
        result = parseStringObject(result);
      }

      return result;
    }

    return result;
  } catch (err) {
    return data;
  }
}

function getAttributeRichText(data) {
  try {
    const stack = [structuredClone(data)];
    let result = [];

    while (stack.length > 0) {
      const current = stack.pop();

      if (_.has(current, "content")) {
        current.content.forEach((child) => stack.unshift(child));
      } else if (_.has(current?.attrs, "value")) {
        result.push(current);
      }
    }

    return result;
  } catch (err) {}
}

function completeRichTextValue(data, val) {
  try {
    let copyData = structuredClone(data);
    let result = copyData;
    let stack = [result];
    let value = structuredClone(structuredClone(val));

    while (stack.length > 0) {
      const current = stack.pop();

      if (_.has(current, "content")) {
        current.content.forEach((child) => stack.push(child));
      } else if (
        _.has(current?.attrs, "answer") ||
        _.has(current?.attrs, "answers")
      ) {
        const currentVal = value.pop();

        current.attrs["value"] = currentVal?.attrs?.value ?? currentVal?.value;
      }
    }

    return result;
  } catch (err) {
    return data;
  }
}

function isVarEmpty(variable) {
  if (variable) {
    switch (variable.constructor.name) {
      case "Object":
        {
          return Object.keys(variable).length == 0;
        }
        break;

      case "Array":
        {
          return variable.length == 0;
        }
        break;
      case "String":
        {
          return variable != "";
        }
        break;
    }
  }

  return true;
}

function getColor(type = "primary") {
  try {
    let result;

    switch (type) {
      case "primary":
        {
          result =
            window?.getComputedStyle &&
            document &&
            window
              ?.getComputedStyle(document?.querySelector(":root"))
              .getPropertyValue("--color-primary");
        }
        break;

      case "secondary":
        {
          result =
            window?.getComputedStyle &&
            document &&
            window
              ?.getComputedStyle(document?.querySelector(":root"))
              .getPropertyValue("--color-secondary");
        }
        break;

      case "light-accent":
        {
          result =
            window?.getComputedStyle &&
            document &&
            window
              ?.getComputedStyle(document?.querySelector(":root"))
              .getPropertyValue("--color-light-accent");
        }
        break;
    }

    return result;
  } catch (err) {}
}

function fontZH() {
  try {
    return getCurrentLanguage() == "zh" ? "font-zh" : "";
  } catch (err) {
    return "";
  }
}

function switchLang(newLang) {
  try {
    Language.setLanguage(newLang);
    // App Router–safe: build current path from window, then apply locale and navigate
    const asPath =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "";
    const path = hrefLocale(asPath || "/");
    if (typeof window !== "undefined") {
      window.location.replace(path);
    }
  } catch (err) {}
}

function getYoutubeID(url) {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length == 11 ? match[7] : false;
}

function refactorYoutubeURL(youtubeURL) {
  const youtubeID = getYoutubeID(youtubeURL);
  return (
    "https://www.youtube.com/embed/" +
    youtubeID +
    "?autoplay=1&loop=1&playlist=" +
    youtubeID +
    "&mute=1&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&autohide=1&rel=0"
  );
}

function refactorWhatsappLink(params) {
  try {
    const { text, phone } = params;

    const result = `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;
    return result;
  } catch (err) {
    return null;
  }
}

const Helpers = {
  refactorWhatsappLink,
  refactorYoutubeURL,
  getYoutubeID,
  switchLang,
  fontZH,
  getColor,
  isVarEmpty,
  completeRichTextValue,
  getAttributeRichText,
  hrefLocale,
  changeRouter,
  parseStringObject,
  getCurrentLanguage,
  objectToFormData,
  formatDateISO,
  isStringEqual,
  currencyFormatter,
  removeEmptyValue,
  getDescendantProp,
  filterObjectByKey,
  openSnackbar,
  difference,
  addArray,
  compareObject,
  groupObjectWithArrayFormat,
  hasClassName,
  percentage,
  parseQuery,
  secondsToHms,
  validateEmail,
  generateMonth,
  fetchContentType,
  randomNumber,
  isPropertyEmpty,
  combineArrayOfObject,
  changeSlugWithoutReload,
  formatDate_ddmmyyyy,
  formatDate_yyyymmdd,
  encryption,
  intersectArray,
  isArrayEqual,
  isValidHttpUrl,
  secondToMinute,
  minuteToSecond,
  generateDate,
  extractEffectiveDate,
  getUniqueFromArrayOfObjectbyId,
  removeArrayOfObjectbyId,
  isURL,
  formatTimeNow_hhmmss,
  getRangeDate,
  isPropertyFilledOne,
  sleep,
  replaceString,
  addMarkOnString,
  removeMarkOnString,
  markStringByKeyword,
  delayFunction,
  downloadBlob,
  generateDaysOfDate,
  changeQueriesWithoutReload,
  generateFormatTime,
  getImagesFromHtml,
  time_convert,
  convertNumberToLetter,
  filterDataByKeyword,
  addStr,
  calculateTimeLeft,
  structuredClone,
  splitURLToName,
  refactorHead,
  b64toBlob,
  getDateValueFromSlashFormat,
  getWeekOfMonth,
  recursiveLoop,
  pushURLWithoutReload,
  formatDateDefault,
  formatBytes,
};

export default Helpers;
