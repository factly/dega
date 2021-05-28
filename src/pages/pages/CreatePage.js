import React from 'react';
import PageForm from '../posts/components/PostForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPage } from '../../actions/pages';
import getUserPermission from '../../utils/getUserPermission';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';

function CreatePage({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'pages', action: 'get', spaces });

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addPage(values));
  };
  if (!formats.loading && formats.article) {
    return <PageForm onCreate={onCreate} actions={actions} page={true} format={formats.article} />;
  }
  return <FormatNotFound status="info" title="Article format not found" link="/formats" />;
}

export default CreatePage;
