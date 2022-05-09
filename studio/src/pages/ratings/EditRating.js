import React from 'react';
import RatingEditForm from './components/RatingForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateRating, getRating } from '../../actions/ratings';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';

function EditRating() {
  const history = useHistory();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { rating, loading } = useSelector((state) => {
    return {
      rating: state.ratings.details[id] ? state.ratings.details[id] : null,
      loading: state.ratings.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getRating(id));
  }, [dispatch, id]);

  if (loading) return <Skeleton />;

  if (!rating) {
    return <RecordNotFound />;
  }

  const onUpdate = (values) => {
    dispatch(updateRating({ ...rating, ...values })).then(() =>
      history.push(`/ratings/${id}/edit`),
    );
  };

  return (
    <>
      <Helmet title={`${rating?.name} - Edit Rating`} />
      <RatingEditForm data={rating} onCreate={onUpdate} />
    </>
  );
}

export default EditRating;
