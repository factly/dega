import React from 'react';
import TagsCreateForm from './components/TagsCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { addTag } from '../../actions/tags';
import { useHistory } from 'react-router-dom';
import useQuery from '../../utils/useQuery';
import _ from 'lodash';

function EditTag() {
  const history = useHistory();
  const query = useQuery();
  const id = query.get('id');

  const dispatch = useDispatch();
  const { tag } = useSelector((state) => {
    const { tags, ...other } = state.tags;
    const tag = _.find(tags, { id: parseInt(id) });
    return {
      tag,
      ...other,
    };
  });

  const onCreate = (values) => {
    dispatch(addTag(values));
    history.push('/tags');
    console.log('Received values of form: ', values);
  };
  return <TagsCreateForm data={tag} onCreate={onCreate} />;
}

export default EditTag;
