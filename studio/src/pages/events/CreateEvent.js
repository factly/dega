import React from 'react';
import { useDispatch } from 'react-redux';
import { createEvent } from '../../actions/events';
import { useHistory } from 'react-router-dom';
import EventCreateForm from './components/EventForm';
import { Helmet } from 'react-helmet';

function CreateEvent() {
  const history = useHistory();
  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createEvent(values)).then(() => history.push('/admin/events'));
  };
  return (
    <>
      <Helmet title={'Create Event'} />
      <EventCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateEvent;
