import React from 'react';
import FormatsList from './components/FormatsList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Formats() {
  return (
    <Space direction="vertical">
      <Link key="1" to="/formats/create">
        <Button>Create New</Button>
      </Link>
      <FormatsList />
    </Space>
  );
}

export default Formats;
