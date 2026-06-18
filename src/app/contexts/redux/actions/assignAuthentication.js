const assignMainLayout = (params) => async (dispatch) => {
  dispatch({
    type: params?.type || "ASSIGN_AUTHENTICATION_GENERIC",
    payload: params,
  });
};

export default assignMainLayout;
