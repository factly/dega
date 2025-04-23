import React from "react";
import SpaceCreateForm from "./components/SpaceCreateForm";
import { useDispatch } from "react-redux";
import { getSpaces, addSpace } from "../../actions/spaces";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { SpaceFormValues } from "./types";
import { AppDispatch } from "../../store/index";

function CreateSpace(): React.ReactElement {
  const history = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const onCreate = async (values: SpaceFormValues): Promise<void> => {
    try {
      // First add the space
      await dispatch(addSpace(values));

      // Then fetch all spaces (including the new one)
      await dispatch(getSpaces());

      // Navigate to spaces list
      history("/admin/spaces");
    } catch (error) {
      console.error("Error creating space:", error);
      // Error notification is handled in the action
    }
  };

  return (
    <>
      <Helmet title={"Create Space"} />
      <SpaceCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateSpace;
