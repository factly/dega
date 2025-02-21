import React from 'react';
import RatingCreateForm from './components/RatingForm';
import { useDispatch } from 'react-redux';
import { createRating } from '../../actions/ratings';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';
import { AppDispatch, Rating } from '../../types';

const CreateRating: React.FC = () => {
  const history = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const handleCreate = async (values: Rating) => {
    await dispatch(createRating(values));
    history('/ratings');
  };

  return (
    <>
      <Helmet title="Create Rating" />
      <RatingCreateForm onCreate={handleCreate} />
    </>
  );
};

export default CreateRating;