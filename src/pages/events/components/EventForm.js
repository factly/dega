import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import JsonEditor from '../../../components/JsonEditor';

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
  const [json, setJson] = React.useState(
    data.tags && Object.keys(data.tags).length > 0
      ? data.tags
      : {
          app: 'dega',
        },
  );
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
      <Form.Item name="tags" label="Tags">
        <JsonEditor json={json} onChangeJSON={(data) => setJson(data)} />
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
