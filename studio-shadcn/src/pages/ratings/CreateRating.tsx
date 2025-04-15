import React from "react";
import RatingCreateForm from "./components/RatingForm";
import { createRating } from "../../actions/ratings";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Rating } from "./types";

const CreateRating: React.FC = () => {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  const onCreate = (values: Rating) => {
    dispatch(createRating(values))
      .then(() => {
        // Navigate only after successful creation
        history("/ratings");
      })
      .catch((error) => {
        // Error is already handled in the action creator
        console.error("Creation failed:", error);
      });
  };

  return (
    <>
      <Helmet title="Create Rating" />
      <RatingCreateForm onCreate={onCreate} />
    </>
  );
};

export default CreateRating;
