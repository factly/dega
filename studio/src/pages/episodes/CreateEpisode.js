import React from 'react';
import EpisodeCreateForm from './components/EpisodeForm';
import { useDispatch } from 'react-redux';
import { createEpisode } from '../../actions/episodes';

import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function CreateEpisode() {
  const history = useNavigation();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createEpisode(values)).then(() => history('/episodes'));
  };
  return (
    <>
      <Helmet title={'Create Episode'} />
      <EpisodeCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateEpisode;
