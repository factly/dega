import React from 'react';
import PodcastEditForm from './components/PodcastForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updatePodcast, getPodcast } from '../../actions/podcasts';
 
import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function EditPodcast() {
  const history = useNavigation();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { podcast, loading } = useSelector((state) => {
    return {
      podcast: state.podcasts.details[id] ? state.podcasts.details[id] : null,
      loading: state.podcasts.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getPodcast(id));
  }, [dispatch, id]);

  if (loading) return <Skeleton />;

  if (!podcast) {
    return <RecordNotFound />;
  }

  const onUpdate = (values) => {
    dispatch(updatePodcast({ ...podcast, ...values })).then(() =>
      history(`/podcasts/${id}/edit`),
    );
  };

  return (
    <>
      <Helmet title={`${podcast?.title} - Edit Podcast`} />
      <PodcastEditForm data={podcast} onCreate={onUpdate} />
    </>
  );
}

export default EditPodcast;
