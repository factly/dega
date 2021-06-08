import React from 'react';
import PageForm from '../posts/components/PostForm';
import { useDispatch, useSelector } from 'react-redux';
import { addPage } from '../../actions/pages';
import getUserPermission from '../../utils/getUserPermission';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { useHistory } from 'react-router-dom';

function CreatePage({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'pages', action: 'get', spaces });
  const history = useHistory();
  const [newPage, setNewPage] = React.useState(false);
  const pages = useSelector(({ pages }) => pages);
  const dispatch = useDispatch();
  if (newPage) {
    history.push(`/pages/${pages.recent.data.id}/edit`);
    setNewPage(false);
  }
  const onCreate = (values) => {
    if (values.status === 'publish') {
      dispatch(addPage(values)).then(() => setNewPage(true));
    } else {
      dispatch(addPage(values));
    }
  };
  if (!formats.loading && formats.article) {
    return <PageForm onCreate={onCreate} actions={actions} page={true} format={formats.article} />;
  }
  return <FormatNotFound status="info" title="Article format not found" link="/formats" />;
}

export default CreatePage;
