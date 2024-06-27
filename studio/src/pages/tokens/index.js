import React from 'react';
import { Space, Button } from 'antd';
import TokenList from './components/TokenList';
import { Link } from 'react-router-dom';

export default function Tokens() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/advanced/settings`}>
        <Button type="primary"> Back to Settings </Button>
      </Link>

      <Space direction="vertical">
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <Link
            key="1"
            to={{
              pathname: `/advanced/settings/tokens/create`,
            }}
          >
            <Button type="primary"> Generate new tokens </Button>
          </Link>
        </div>

        <TokenList />
      </Space>
    </div>
  );
}
