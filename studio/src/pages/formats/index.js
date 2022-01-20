import React from 'react';
import FormatList from './components/FormatList';
import { Space, Button, Row } from 'antd';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function Formats({ permission }) {
  const { actions } = permission;
  return (
    <Space direction="vertical">
      <Helmet title={'Formats'} />
      <Row justify="end">
        <Link key="1" to="/formats/create">
          <Button
            disabled={!(actions.includes('admin') || actions.includes('create'))}
            type="primary"
          >
            New Format
          </Button>
        </Link>
      </Row>

      <FormatList actions={actions} />
    </Space>
  );
}

export default Formats;
