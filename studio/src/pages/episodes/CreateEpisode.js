import React from 'react';
import EpisodeCreateForm from './components/EpisodeForm';
import { useDispatch } from 'react-redux';
import { addEpisode } from '../../actions/episodes';
import { useHistory } from 'react-router-dom';

function CreateEpisode() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addEpisode(values)).then(() => history.push('/episodes'));
  };
  return <EpisodeCreateForm onCreate={onCreate} />;
}

export default CreateEpisode;
