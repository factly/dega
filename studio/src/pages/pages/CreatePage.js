import React from 'react';
import PageForm from '../posts/components/PostForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPage } from '../../actions/pages';
import getUserPermission from '../../utils/getUserPermission';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function CreatePage({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'pages', action: 'get', spaces });
  const history = useHistory();
  const dispatch = useDispatch();

  const onCreate = (values) => {
    dispatch(addPage(values)).then((page) => {
      if (page && page.id) history.push(`/pages/${page.id}/edit`);
    });
  };
  if (!formats.loading && formats.article) {
    return (
      <>
        <Helmet title={'Create Page'} />
        <PageForm onCreate={onCreate} actions={actions} page={true} format={formats.article} />
      </>
    );
  }
  return <FormatNotFound status="info" title="Article format not found" link="/formats" />;
}

export default CreatePage;
