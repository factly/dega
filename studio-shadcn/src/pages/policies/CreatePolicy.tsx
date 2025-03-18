import React from "react";
import { createPolicy } from "../../actions/policies";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import PolicyCreateForm from "./components/PolicyForm";
import { AppDispatch } from "../../store/index";

// Define the policy value interface
interface PolicyPermission {
  resource: string;
  actions: string[];
}

interface PolicyFormValues {
  name?: string;
  description?: string;
  permissions?: PolicyPermission[];
  [key: string]: any;
}

const CreatePolicy: React.FC = () => {
  const history = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

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
