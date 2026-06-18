import { applyMiddleware, createStore } from "redux";
import { createWrapper } from "next-redux-wrapper";
import thunkMiddleware from "redux-thunk";
import rootReducer from "./reducers";

// create a makeStore function
const makeStore = () =>
  createStore(rootReducer, applyMiddleware(thunkMiddleware));

// export an assembled wrapper
export const wrapper = createWrapper(makeStore, { debug: false });
