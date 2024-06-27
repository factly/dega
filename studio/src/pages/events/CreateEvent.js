import React from 'react';
import { useDispatch } from 'react-redux';
import { createEvent } from '../../actions/events';

import EventCreateForm from './components/EventForm';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function CreateEvent() {
  const history = useNavigation();
  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createEvent(values)).then(() => history('/admin/events'));
  };
  return (
    <>
      <Helmet title={'Create Event'} />
      <EventCreateForm onCreate={onCreate} />
    </>
  );
}

export default CreateEvent;
