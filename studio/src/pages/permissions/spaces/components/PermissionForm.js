import React from 'react';
import { Button, Form, InputNumber, Space, Switch } from 'antd';

const layout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 8,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

const PermissionForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();

  const onReset = () => {
    form.resetFields();
  };

  return (
    <Form
      {...layout}
      form={form}
      initialValues={{ ...data }}
      name="create-category"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
      <Form.Item name="space_id" label="Space">
        <InputNumber />
      </Form.Item>
      <Form.Item
        name="posts"
        label="Posts"
        rules={[
          {
            required: true,
            message: 'Please enter the numeric value!',
          },
        ]}
      >
        <InputNumber min={-1} />
      </Form.Item>
      <Form.Item
        name="media"
        label="Media"
        rules={[
          {
            required: true,
            message: 'Please enter the numeric value!',
          },
        ]}
      >
        <InputNumber min={-1} />
      </Form.Item>
      <Form.Item label="Fact Check" name="fact_check" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item label="Podcast" name="podcast" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default PermissionForm;
