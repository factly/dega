import React from 'react';
import RatingCreateForm from './components/RatingForm';
import { useDispatch } from 'react-redux';
import { createRating } from '../../actions/ratings';
 
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function CreateRating() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createRating(values)).then(() => history('/ratings'));
  };
  return (
    <>
      <Helmet title={'Create Rating'} />
      <RatingCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateRating;
