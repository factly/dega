import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PageList from './components/PageList';
import { useSelector } from 'react-redux';
import getUserPermission from '../../utils/getUserPermission';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';

function Pages({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'pages', action: 'get', spaces });
  if (!formats.loading && formats.article)
    return (
      <Space direction="vertical">
        <Link key="1" to="/pages/create">
          <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
            Create New
          </Button>
        </Link>
        <PageList actions={actions} format={formats.article} />
      </Space>
    );
  return <FormatNotFound status="info" title="Article format not found" link="/formats/create" />;
}

export default Pages;
