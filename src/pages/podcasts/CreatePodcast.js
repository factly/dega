import React from 'react';
import PodcastCreateForm from './components/PodcastForm';
import { useDispatch } from 'react-redux';
import { addPodcast } from '../../actions/podcasts';
import { useHistory } from 'react-router-dom';

function CreatePodcast() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addPodcast(values)).then(() => history.push('/podcasts'));
  };
  return <PodcastCreateForm onCreate={onCreate} />;
}

export default CreatePodcast;
