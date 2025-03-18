import { useEffect } from "react";
import RatingEditForm from "./components/RatingForm";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { updateRating, getRating } from "../../actions/ratings";
import { useParams } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { AppDispatch, RootState } from "../../types/index";

// Type for form values that will be passed to onUpdate
interface RatingFormValues {
  name?: string;
  [key: string]: any;
}

function EditRating(): JSX.Element {
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();

  const dispatch = useDispatch<AppDispatch>();

  const { rating, loading } = useSelector((state: RootState) => {
    return {
      rating: state.ratings.details[id as string]
        ? state.ratings.details[id as string]
        : null,
      loading: state.ratings.loading,
    };
  });

  useEffect(() => {
    if (id) {
      dispatch(getRating(id));
    }
  }, [dispatch, id]);

  if (loading) return <Skeleton className="w-full h-64" />;

  if (!rating) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: RatingFormValues): void => {
    dispatch(updateRating({ ...rating, ...values })).then(() => {
      if (id) {
        history(`/ratings/${id}/edit`);
      }
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
