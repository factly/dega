import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Space, Typography } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { resetPassword } from '../../actions/forgotPassword';
import AuthLayout from './Authlayout';
import degaImage from '../../assets/dega.png';

const { Text } = Typography;

const RecoveryPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get params from URL
  const userId = searchParams.get('userID');
  const verificationCode = searchParams.get('code');
  const orgId = searchParams.get('orgID');

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setError('');

    try {
      await resetPassword(userId, values.password, verificationCode);
      navigate('/auth/login', {
        state: {
          message: 'Password reset successful. Please login with your new password.',
        },
      });
    } catch (error) {
      setError(error.message || 'Failed to reset password. Please try again.');
      setIsLoading(false);
    }
  };

  if (!userId || !verificationCode) {
    return (
      <AuthLayout title="Invalid Recovery Link" logoSrc={degaImage}>
        <Space direction="vertical" size={16} style={{ width: '100%', textAlign: 'center' }}>
          <Text>This password reset link is invalid or has expired.</Text>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/auth/login')}
            style={{ backgroundColor: '#1E1E1E' }}
          >
            Return to Login
          </Button>
        </Space>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Your Password" error={error} logoSrc={degaImage}>
      <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ width: '100%' }}>
        <Form.Item
          name="password"
          label="New Password"
          rules={[
            { required: true, message: 'Please input your new password!' },
            { min: 8, message: 'Password must be at least 8 characters long' },
          ]}
          style={{ marginBottom: 24 }}
        >
          <Input.Password
            size="large"
            placeholder="Enter new password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match!'));
              },
            }),
          ]}
          style={{ marginBottom: 32 }}
        >
          <Input.Password
            size="large"
            placeholder="Confirm new password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isLoading}
            block
            style={{ backgroundColor: '#1E1E1E' }}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
};

export default RecoveryPage;
