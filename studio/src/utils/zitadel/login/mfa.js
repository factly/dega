import React from 'react';
import { Form, Input, Button } from 'antd';

const Mfa = ({ totpCode, setTotpCode, onSubmit }) => {
  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <Form onFinish={handleSubmit}>
      <Form.Item
        label="Enter MFA Code"
        name="totpCode"
        rules={[{ required: true, message: 'Please input your MFA code!' }]}
      >
        <Input
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value)}
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          style={{ backgroundColor: '#1E1E1E' }}
        >
          Verify MFA
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Mfa;