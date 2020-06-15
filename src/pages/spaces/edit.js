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
  };
  return <SpaceCreateForm data={space} onCreate={onCreate} />;
}

export default EditSpace;
