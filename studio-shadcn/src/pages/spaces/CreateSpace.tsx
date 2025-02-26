import React from "react";
import SpaceCreateForm from "./components/SpaceCreateForm";
import { useDispatch } from "react-redux";
import { getSpaces, addSpace } from "../../actions/spaces";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { SpaceFormValues } from "./components/SpaceCreateForm";
import { AppDispatch } from "../../store/index";

function CreateSpace(): React.ReactElement {
  const history = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const onCreate = (values: SpaceFormValues): void => {
    dispatch(addSpace(values)).then(() => {
      dispatch(getSpaces());
      history("/admin/spaces");
    });
  };

  return (
    <>
      <Helmet title={"Create Space"} />
      <SpaceCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateSpace;
