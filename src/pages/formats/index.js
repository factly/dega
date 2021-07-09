import React from 'react';
import FormatList from './components/FormatList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Formats({ permission }) {
  const { actions } = permission;
  return (
    <Space direction="vertical">
      <Link key="1" to="/formats/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      <FormatList actions={actions} />
    </Space>
  );
}

export default Formats;
