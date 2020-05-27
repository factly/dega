import React from 'react';
import SpaceCreateForm from './components/SpaceCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { addSpaces } from '../../actions/spaces';
import { useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';

function EditSpace() {
  const history = useHistory();
  let { id } = useParams();
  console.log('Bre', id);
  const dispatch = useDispatch();
  const { space } = useSelector((state) => {
    const { spaces, ...other } = state.spaces;
    const organisation = _.find(spaces, { id: 3 });
    if (!organisation) return [];
    return {
      space: _.find(organisation.spaces, { id: parseInt(id) }),
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

export default EditSpace;
