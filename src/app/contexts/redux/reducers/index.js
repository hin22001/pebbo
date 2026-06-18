import { combineReducers } from "redux";
import mainLayoutReducers from "./mainLayoutReducers";
import authenticationReducers from "./authenticationReducers";

export default combineReducers({
  mainLayout: mainLayoutReducers,
  authentication: authenticationReducers,
});
