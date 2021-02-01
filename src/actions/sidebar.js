export const setCollapse = (collapsed) => {
  return (dispatch) => {
    dispatch({
      type: collapsed,
    });
  };
};
