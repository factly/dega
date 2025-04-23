import React from "react";
import ClaimantCreateForm from "./components/ClaimantForm";
import { createClaimant } from "../../actions/claimants";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { ClaimantFormValues } from "./types";

const CreateClaimant: React.FC = () => {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: ClaimantFormValues) => {
    dispatch(createClaimant(values))
      .then(() => {
        // Navigate only after successful creation
        history("/claimants");
      })
      .catch((error) => {
        // Error is already handled in the action creator
        console.error("Creation failed:", error);
      });
  };

  return (
    <>
      <Helmet title={"Create Claimant"} />
      <ClaimantCreateForm onCreate={onCreate} />
    </>
  );
};

export default CreateClaimant;
