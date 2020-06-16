import React from 'react';
import TagsCreateForm from './components/TagsCreateForm';
import { useDispatch, useSelector } from 'react-redux';
import { updateTag } from '../../actions/tags';
import { useHistory } from 'react-router-dom';
import useQuery from '../../utils/useQuery';

function EditTag() {
  const history = useHistory();
  const query = useQuery();
  const id = query.get('id');

  const dispatch = useDispatch();
  const { tag } = useSelector((state) => {
    const { details } = state.tags;
    const tag = details[id];

    return {
      tag,
    };
  });

  const onCreate = (values) => {
    dispatch(updateTag({ ...tag, ...values }));
    history.push('/tags');
  };
  return <TagsCreateForm data={tag} onCreate={onCreate} />;
}

export default EditTag;
