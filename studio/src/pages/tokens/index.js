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
      <Space direction="vertical">
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <Link
            key="1"
            to={{
              pathname: `/settings/advanced/tokens/create`,
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
