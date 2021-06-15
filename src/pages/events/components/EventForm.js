import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import Selector from '../../../components/Selector';

const EventForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const onReset = () => {
    form.resetFields();
  };
  return (
    <Form
      form={form}
      initialValues={{ ...data }}
      name="create-event"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
      <Form.Item name="name">
        <Input placeholder="Enter name" />
      </Form.Item>
      <Form.Item name="tags">
        <Selector mode="multiple" action="Tags" createEntity="Tag" />
      </Form.Item>
      <Form.Item>
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
