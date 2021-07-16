import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import MonacoEditor from '../../../components/MonacoEditor';
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
  if (data && data.tags) {
    if (typeof data.tags !== 'string') {
      data.tags = JSON.stringify(data.tags);
    }
  }

  const onReset = () => {
    form.resetFields();
  };
  const getJsonVal = (val) => {
    let regex = /,(?!\s*?[{["'\w])/;
    let formattedJson = val.replace(regex, '');
    return JSON.parse(formattedJson);
  };
  return (
    <Form
      {...layout}
      form={form}
      initialValues={{ ...data }}
      name="create-event"
      onFinish={(values) => {
        if (values.tags) {
          values.tags = getJsonVal(values.tags);
        }
        onCreate(values);
        onReset();
      }}
    >
      <Form.Item name="name" label="Name">
        <Input placeholder="Enter name" />
      </Form.Item>
      <Form.Item name="tags" label="Tags">
        <MonacoEditor />
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
