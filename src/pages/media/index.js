import React from 'react';
import { Space, Button } from 'antd';

import MediumList from './components/MediumList';
import { Link } from 'react-router-dom';

function Media({ permission }) {
  const { actions } = permission;
  return (
    <Space direction="vertical">
      <Link to="/media/upload">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Upload
        </Button>
      </Link>
      <MediumList actions={actions} />
    </Space>
  );
}

export default Media;
