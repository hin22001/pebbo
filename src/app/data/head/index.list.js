import * as components from "./components";
import * as global from "./global";

module.exports = {
  ...(components || {}),
  ...(global || {}),
};
