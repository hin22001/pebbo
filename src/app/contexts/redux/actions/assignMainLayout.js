const assignMainLayout = (params) => (dispatch) => {
  dispatch({
    type: params?.type || "ASSIGN_MAIN_LAYOUT_GENERIC",
    disableSessionStore: Boolean(params?.disableSessionStore),
    payload: params,
  });
};

export default assignMainLayout;
