import React from 'react';
import PodcastCreateForm from './components/PodcastForm';
import { useDispatch } from 'react-redux';
import { addPodcast } from '../../actions/podcasts';
 
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function CreatePodcast() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addPodcast(values)).then(() => history('/podcasts'));
  };
  return (
    <>
      <Helmet title={'Create Podcast'} />
      <PodcastCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreatePodcast;
