import React from 'react';
import SpaceCreateForm from './components/SpaceCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { addSpaces } from '../../actions/spaces';
import { useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';

function CreateSpace() {
  const history = useHistory();
  let { id } = useParams();
  console.log('Bre', id);
  const dispatch = useDispatch();
  const { space } = useSelector((state) => {
    const { spaces: data, ...other } = state.spaces;
    return {
      space: _.find(data, { id }),
      ...other,
    };
  });

  const onCreate = (values) => {
    dispatch(addSpaces(values));
    history.push('/spaces');
    console.log('Received values of form: ', values);
  };
  return <SpaceCreateForm data={space} onCreate={onCreate} />;
}

export default CreateSpace;
