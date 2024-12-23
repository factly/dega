import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Typography } from 'antd';

const { Text } = Typography;

const RequestReset = ({ userEmail, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div style={{ width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Text style={{ fontSize: '14px', color: '#333' }}>
            A verification code will be sent to: <strong>{userEmail}</strong>
          </Text>
        </div>
        <div>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              width: '100%',
              backgroundColor: '#1E1E1E',
              borderColor: '#1E1E1E'
            }}
          >
            Send Verification Code
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RequestReset;