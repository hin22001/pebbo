import { TempData } from "@/app/data/local";

const authenticationReducers = (state = {}, action) => {
  try {
    const isReduxReset = action.type[0] == "@";

    if (!isReduxReset && !action.disableSessionStore) {
      TempData.setData({
        name: "AUTHENTICATION_REDUCERS_" + action.type,
        data: action.payload,
        type: "pathname",
      });
    }

    let refactorState = {};

    switch (action.type) {
      case "ASSIGN_IS_LOGIN":
        {
          refactorState = { ...state, isLogin: action.payload };
        }
        break;

      case "ASSIGN_SHOW_LOGIN":
        {
          refactorState = { ...state, showLogin: action.payload }; // ===> use random number value so the componentdidupdate in auth layer will be triggered
        }
        break;

      case "ASSIGN_SHOW_LOGIN_SPECIFIC_SCREEN":
        {
          refactorState = {
            ...state,
            showLogin: action.payload?.showLogin, // ===> use random number value so the componentdidupdate in auth layer will be triggered
            activeScreen: action.payload?.activeScreen,
          };
        }
        break;

      default:
        {
          refactorState = state;
          TempData.removeData("AUTHENTICATION_REDUCERS_" + action.type);
        }
        break;
    }

    return refactorState;
  } catch (err) {}
};

export default authenticationReducers;
