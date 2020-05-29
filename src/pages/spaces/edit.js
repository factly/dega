import React from 'react';
import SpaceCreateForm from './components/SpaceCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { addSpaces } from '../../actions/spaces';
import { useHistory } from 'react-router-dom';
import useQuery from '../../utils/useQuery';
import _ from 'lodash';

function EditSpace() {
  const history = useHistory();
  const query = useQuery();
  const id = query.get('id');

  const dispatch = useDispatch();
  const { space } = useSelector((state) => {
    const spaces = _.flatten(_.map(state.spaces.spaces, 'spaces'));
    if (!spaces) return [];
    return {
      space: _.find(spaces, { id: parseInt(id) }),
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
