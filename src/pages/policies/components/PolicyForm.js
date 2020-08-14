import React from 'react';
import { Row, Col, Form, Input, Button } from 'antd';
import Selector from '../../../components/Selector';
import Permission from '../../../components/Permission';

const entities = [
  'categories',
  'tags',
  'formats',
  'media',
  'posts',
  'claimants',
  'ratings',
  'claims',
  'factchecks',
  'policies',
];

function PolicyForm({ data = {}, onCreate }) {
  const [form] = Form.useForm();

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={data}
      name="create-policy"
      style={{ maxWidth: '100%', width: '100%' }}
      onFinish={(values) =>
        onCreate({
          ...values,
          permissions: Object.keys(values.permissions)
            .filter((key) => values.permissions[key] && values.permissions[key].length > 0)
            .map((key) => ({ resource: key, actions: values.permissions[key] })),
          users: values.users.map((item) => item.toString()),
        })
      }
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="users" label="Users">
            <Selector mode="multiple" display={'email'} action="Authors" />
          </Form.Item>
        </Col>
      </Row>
      {entities.map((item) => (
        <Form.Item key={'permissions-' + item} name={['permissions', item]} label={item}>
          <Permission />
        </Form.Item>
      ))}
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form>
  );
}

export default PolicyForm;
