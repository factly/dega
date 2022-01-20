import React from 'react';
import EpisodeEditForm from './components/EpisodeForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateEpisode, getEpisode } from '../../actions/episodes';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';

function EditEpisode() {
  const history = useHistory();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { episode, loading } = useSelector((state) => {
    return {
      episode: state.episodes.details[id] ? state.episodes.details[id] : null,
      loading: state.episodes.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getEpisode(id));
  }, [dispatch, id]);

  if (loading) return <Skeleton />;

  if (!episode) {
    return <RecordNotFound />;
  }

  const onUpdate = (values) => {
    dispatch(updateEpisode({ ...episode, ...values })).then(() =>
      history.push(`/episodes/${id}/edit`),
    );
  };

  return (
    <>
      <Helmet title={`${episode?.title} - Edit Episode`} />
      <EpisodeEditForm data={episode} onCreate={onUpdate} />
    </>
  );
}

export default EditEpisode;
