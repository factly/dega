import React from 'react';
import EpisodeCreateForm from './components/EpisodeForm';
import { useDispatch } from 'react-redux';
import { createEpisode } from '../../actions/episodes';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function CreateEpisode() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createEpisode(values)).then(() => history.push('/episodes'));
  };
  return (
    <>
      <Helmet title={'Create Episode'} />
      <EpisodeCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateEpisode;
