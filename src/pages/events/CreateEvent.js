import React from 'react';
import { useDispatch } from 'react-redux';
import { addEvent } from '../../actions/events';
import { useHistory } from 'react-router-dom';
import EventCreateForm from './components/EventForm';

function CreateEvent() {
  const history = useHistory();
  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addEvent(values)).then(() => history.push('/events'));
  };
  return <EventCreateForm onCreate={onCreate} />;
}

export default CreateEvent;
