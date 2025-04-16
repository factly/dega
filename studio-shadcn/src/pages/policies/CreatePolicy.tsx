import React from "react";
import { createPolicy } from "../../actions/policies";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import PolicyCreateForm from "./components/PolicyForm";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { PolicyFormValues } from "./types";

const CreatePolicy: React.FC = () => {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: PolicyFormValues): void => {
    // Filter out incomplete permission entries
    values.permissions = values.permissions?.filter(
      (item) => item && item.resource && item.actions.length > 0
    );

    // Dispatch the create action and navigate on success
    dispatch(createPolicy(values)).then(() =>
      history("/settings/members/policies")
    );
  };

  return (
    <>
      <Helmet title={"Create Policy"} />
      <PolicyCreateForm onCreate={onCreate} />
    </>
  );
};

export default CreatePolicy;
