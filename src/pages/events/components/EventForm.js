import React from 'react';
import { Button, Form, Input, Space } from 'antd';

const layout = {
  labelCol: {
    span: 9,
  },
  wrapperCol: {
    span: 7,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

const EventForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const onReset = () => {
    form.resetFields();
  };
  return (
    <Form
      {...layout}
      form={form}
      initialValues={{ ...data }}
      name="create-event"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
      <Form.Item name="name" label="Name">
        <Input placeholder="Enter name" />
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
export default EventForm;
