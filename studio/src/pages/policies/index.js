import React from 'react';
import { Space, Button, Row } from 'antd';
import { Link } from 'react-router-dom';
import PolicyList from './components/PolicyList';
import getUserPermission from '../../utils/getUserPermission';
import { useSelector } from 'react-redux';

function Policies() {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'policies', action: 'get', spaces });

  return (
    <Space direction="vertical">
      <Row gutter={16} justify="end">
        <Link to="/members/policies/create">
          <Button
            disabled={!(actions.includes('admin') || actions.includes('create'))}
            type="primary"
          >
            New Policy
          </Button>
        </Link>
      </Row>

      <PolicyList actions={actions} />
    </Space>
  );
}

export default Policies;
