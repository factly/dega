import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import getUserPermission from '../../utils/getUserPermission';
import { useSelector } from 'react-redux';
import FactCheckList from '../../components/List';

function FactCheck() {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'factchecks', action: 'get', spaces });
  return (
    <Space direction="vertical">
      <Link to="/fact-check/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      <FactCheckList actions={actions} format={2} />
    </Space>
  );
}

export default FactCheck;
