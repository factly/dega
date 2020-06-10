import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Form, Input, Space, Divider, Select } from 'antd';
const { TextArea } = Input;
const { Option } = Select;

const layout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 14,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

const SpaceCreateForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const {
    spaces: { spaces },
  } = useSelector((state) => state);

  const onReset = () => {
    form.resetFields();
  };

  return (
    <Form
      {...layout}
      form={form}
      initialValues={data}
      name="create-space"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
      <Form.Item label="Address">
        <Input.Group compact>
          <Form.Item
            name="organazation"
            noStyle
            rules={[{ required: true, message: 'Organazation is required' }]}
          >
            <Select style={{ width: '40%' }} placeholder="Select organazation">
              {spaces.map((space) => (
                <Option key={space.id} value={space.id}>
                  {space.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="name" noStyle rules={[{ required: true, message: 'Name is required' }]}>
            <Input style={{ width: '60%' }} placeholder="Input name" />
          </Form.Item>
        </Input.Group>
      </Form.Item>
      <Form.Item
        name="slug"
        label="Slug"
        rules={[
          {
            required: true,
            message: 'Please input the slug of space!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="site_address"
        label="Website"
        rules={[
          {
            required: true,
            message: 'Please input the website of space!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="site_title"
        label="Title"
        rules={[
          {
            required: true,
            message: 'Please input the title of space!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="tag_line"
        label="Tag line"
        rules={[
          {
            required: true,
            message: 'Please input the tag line of space!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Divider></Divider>
      <strong>
        <Form.Item label="About Space"></Form.Item>
      </strong>
      <Form.Item
        name="contact_info"
        label="Contact Info"
        rules={[{ required: true, message: 'Please input your contact number!' }]}
      >
        <Input style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[
          {
            required: true,
            message: 'Please input the description of space!',
          },
        ]}
      >
        <TextArea />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default SpaceCreateForm;
