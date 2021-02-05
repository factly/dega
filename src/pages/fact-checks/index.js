import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import getUserPermission from '../../utils/getUserPermission';
import { useSelector } from 'react-redux';
import FactCheckList from '../../components/List';

function FactCheck({formats}) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'factchecks', action: 'get', spaces });
  return (
    <Space direction="vertical">
      <Link to="/fact-check/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      { (!formats.loading && formats.factcheck) ? <FactCheckList actions={actions} format={formats.factcheck} /> : null}
    </Space>
  );
}

export default FactCheck;
