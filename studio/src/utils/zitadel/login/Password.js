import React from 'react';
import { Form, Input, Button, Space } from 'antd';

const Password = ({ password, setPassword, onSubmit, onForgotPassword }) => {
  const handlePasswordSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Form onFinish={handlePasswordSubmit} initialValues={{ password: password }}>
        <Form.Item
          label="Password"
          name="password"
          labelCol={{ span: 24 }}
          rules={[
            { message: 'Please input your password!' },
            { min: 8, message: 'Password must be at least 8 characters' },
          ]}
          style={{ marginBottom: 32 }}
        >
          <Input.Password onChange={(e) => setPassword(e.target.value)} size="large" />
        </Form.Item>

        <div style={{ position: 'relative', marginTop: 24 }}>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{ backgroundColor: '#1E1E1E' }}
            >
              Log In
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span
              onClick={onForgotPassword}
              style={{ color: '#1E1E1E', textDecoration: 'none', cursor: 'pointer' }}
            >
              Forgot Password?
            </span>
          </div>
        </div>
      </Form>
    </Space>
  );
};

export default Password;
