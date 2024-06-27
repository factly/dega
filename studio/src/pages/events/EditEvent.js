import React from 'react';
import EventEditForm from './components/EventForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateEvent, getEvent } from '../../actions/events';

import { useParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function EditEvent() {
  const history = useNavigation();
  const { id } = useParams();

  const dispatch = useDispatch();
  const { event, loading } = useSelector((state) => {
    return {
      event: state.events.details[id] ? state.events.details[id] : null,
      loading: state.events.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getEvent(id));
  }, [dispatch, id]);

  if (loading) return <Skeleton />;

  if (!event) {
    return <RecordNotFound />;
  }

  const onUpdate = (values) => {
    dispatch(updateEvent({ ...event, ...values }));
    history(`/admin/events/${id}/edit`);
  };
  return (
    <>
      <Helmet title={'Edit Event'} />
      <EventEditForm data={event} onCreate={onUpdate} />
    </>
  );
}

export default EditEvent;
