import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AddUsers = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFinish = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        profile: {
          givenName: values.firstName,
          familyName: values.lastName,
          displayName: `${values.firstName} ${values.lastName}`,
        },
        email: {
          email: values.email,
          isVerified: false,
        },
        password: {
          password: values.password,
          changeRequired: false,
        },
      };

      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/human`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      message.success('User created successfully');
      navigate('/settings/members');
    } catch (error) {
      console.error('Error creating user:', error);
      message.error('Failed to create user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Button
        icon={<LeftOutlined />}
        style={{ marginBottom: '24px', marginLeft: '-12px' }}
        onClick={() => navigate('/settings/organisations')}
      >
        Back to Organisations
      </Button>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <Title level={2} style={{ marginBottom: '24px' }}>
          Create New User
        </Title>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'First name is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Last name is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting} block>
              {isSubmitting ? 'Creating User...' : 'Create User'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddUsers;
