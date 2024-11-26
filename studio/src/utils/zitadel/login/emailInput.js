import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Space, Typography } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';

const { Text } = Typography;
const EmailInput = ({ email, setEmail, onSubmit, handleGoogleSignIn }) => {
  const handleEmailSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Form onFinish={handleEmailSubmit} initialValues={{ email: email }}>
        <Form.Item
          label="Email"
          name="email"
          labelCol={{ span: 24 }}
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input type="email" onChange={(e) => setEmail(e.target.value)} size="large" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            style={{ backgroundColor: '#1E1E1E' }}
          >
            Next
          </Button>
        </Form.Item>
      </Form>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          margin: '4px 0',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: '#e5e5e5',
          }}
        ></div>
        <span
          style={{
            color: '#666',
            fontSize: '14px',
          }}
        >
          or
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: '#e5e5e5',
          }}
        ></div>
      </div>

      <Button
        icon={<GoogleOutlined />}
        size="large"
        block
        onClick={handleGoogleSignIn}
        style={{
          backgroundColor: '#4285F4',
          color: 'white',
        }}
      >
        Sign in with Google
      </Button>

      <div className="ant-row" style={{ justifyContent: 'center', marginTop: '16px' }}>
        <Text style={{ color: '#15171a' }}>
          Don't have an account?{' '}
          <Link
            to="/auth/registration"
            style={{
              color: '#1E1E1E',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1890ff';
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#1E1E1E';
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Sign up
          </Link>
        </Text>
      </div>
    </Space>
  );
};

export default EmailInput;
