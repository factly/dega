import React, { useEffect } from "react";
import RatingEditForm from "./components/RatingForm";
import { useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { updateRating, getRating } from "../../actions/ratings";
import { useParams } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { RootState, RatingFormValues } from "./types";

function EditRating(): React.ReactElement {
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();

  const dispatch = useAppDispatch();

  const { rating, loading } = useSelector((state: RootState) => {
    return {
      rating:
        id && state.ratings.details[id] ? state.ratings.details[id] : null,
      loading: state.ratings.loading,
    };
  });

  useEffect(() => {
    if (id) {
      dispatch(getRating(id));
    }
  }, [dispatch, id]);

  if (loading) return <Skeleton className="h-48 w-full" />;

  if (!rating) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: RatingFormValues): void => {
    const updatedRating = {
      ...rating,
      ...values,
      id: rating.id,
      description: rating.description,
    };

    dispatch(updateRating(updatedRating))
      .then(() => {
        // Navigate only after successful update
        history(`/ratings/${id}/edit`);
      })
      .catch((error) => {
        // Error is already handled in the action creator
        console.error("Update failed:", error);
      });
  };

  return (
    <>
      <Helmet title={`${rating?.name} - Edit Rating`} />
      <RatingEditForm data={rating} onCreate={onUpdate} />
    </>
  );
}

export default EditRating;
