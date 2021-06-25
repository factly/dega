import React from 'react';
import { Row, Col, Form, Input, Button, Checkbox } from 'antd';
import Selector from '../../../components/Selector';

const options = [
  { label: 'Get', value: 'get' },
  { label: 'Create', value: 'create' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
];

const entities = [
  {
    name: 'posts',
    label: 'Posts',
    options: [...options, { label: 'Publish', value: 'publish' }],
  },
  {
    name: 'categories',
    label: 'Categories',
    options: options,
  },
  {
    name: 'tags',
    label: 'Tags',
    options: options,
  },
  {
    name: 'formats',
    label: 'Formats',
    options: options,
  },
  {
    name: 'media',
    label: 'Media',
    options: options,
  },
  {
    name: 'fact-checks',
    label: 'Fact Check',
    options: options,
  },
  {
    name: 'claims',
    label: 'Claims',
    options: options,
  },
  {
    name: 'claimants',
    label: 'Claimants',
    options: options,
  },
  {
    name: 'ratings',
    label: 'Ratings',
    options: options,
  },
  {
    name: 'policies',
    label: 'policies',
    options: options,
  },
  {
    name: 'podcasts',
    label: 'Podcasts',
    options: options,
  },
  {
    name: 'episodes',
    label: 'Episodes',
    options: options,
  },
  {
    name: 'menus',
    label: 'Menus',
    options: options,
  },
  {
    name: 'pages',
    label: 'Pages',
    options: options,
  }
];

function PolicyForm({ data = {}, onCreate }) {
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);

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
      onValuesChange={() => {
        setValueChange(true);
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: 'Please input your name!' },
              { min: 3, message: 'Name must be minimum 3 characters.' },
              { max: 50, message: 'Name must be maximum 50 characters.' },
            ]}
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
      {entities.map((entity, index) => (
        <Form.Item
          key={'permissions-' + index}
          name={['permissions', entity.name]}
          label={entity.label}
        >
          <Checkbox.Group options={entity.options} />
        </Form.Item>
      ))}
      <Button disabled={!valueChange} type="primary" htmlType="submit">
        {data && data.id ? 'Update' : 'Submit'}
      </Button>
    </Form>
  );
}

export default PolicyForm;
