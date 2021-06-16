import React from 'react';
import { Button, Form, Input, Space, Switch } from 'antd';
import Selector from '../../../components/Selector';

const layout = {
  labelCol: {
    span: 8,
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

const WebhookForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);
  const onReset = () => {
    form.resetFields();
  };
  const onSave = (values) => {
    values.event_ids = values.events || [];
    onCreate(values);
  };
  return (
    <Form
      {...layout}
      form={form}
      initialValues={{ ...data }}
      name="create-webhook"
      onFinish={(values) => {
        onSave(values);
        onReset();
      }}
      onValuesChange={() => {
        setValueChange(true);
      }}
    >
      <Form.Item name="events" label="Events">
        <Selector action="Events" mode="multiple" />
      </Form.Item>
      <Form.Item name="url" label="Url">
        <Input />
      </Form.Item>
      <Form.Item label="Enable" name="enabled" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space>
          <Button disabled={!valueChange} type="primary" htmlType="submit">
            {data && data.id ? 'Update' : 'Submit'}
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default WebhookForm;
