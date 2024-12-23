import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Space } from 'antd';

const ResetPassword = ({
  verificationCode,
  setVerificationCode,
  newPassword,
  setNewPassword,
  onSubmit,
}) => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Form onFinish={onSubmit} layout="vertical">
        <Form.Item
          label="Verification Code"
          name="verificationCode"
          rules={[{ message: 'Please input verification code!' }]}
          initialValue={verificationCode}
        >
          <Input size="large" onChange={(e) => setVerificationCode(e.target.value)} />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ message: 'Please input new password!' }]}
          initialValue={newPassword}
        >
          <Input.Password size="large" onChange={(e) => setNewPassword(e.target.value)} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            style={{ backgroundColor: '#1E1E1E' }}
          >
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </Space>
  );
};

export default ResetPassword;
