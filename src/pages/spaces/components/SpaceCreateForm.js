import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Form, Input, Select } from 'antd';
import { maker, checker } from './../../../utils/sluger';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Option } = Select;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const SpaceCreateForm = ({ onCreate }) => {
  const [form] = Form.useForm();
  const orgs = useSelector((state) => state.spaces.orgs);

  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  return (
    <Form
      {...layout}
      form={form}
      name="create-space"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
      style={{
        paddingTop: '24px',
      }}
    >
      <Form.Item label="Name">
        <Input.Group compact>
          <Form.Item
            name="organisation_id"
            noStyle
            rules={[{ required: true, message: 'organisation is required' }]}
          >
            <Select style={{ width: '40%' }} placeholder="Select organisation">
              {orgs.map((org) => (
                <Option key={org.id} value={org.id}>
                  {org.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            noStyle
            rules={[
              { required: true, message: 'Name is required' },
              { min: 3, message: 'Name must be minimum 3 characters.' },
              { max: 50, message: 'Name must be maximum 50 characters.' },
            ]}
          >
            <Input
              style={{ width: '60%' }}
              placeholder="Input name"
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </Form.Item>
        </Input.Group>
      </Form.Item>
      <Form.Item
        name="slug"
        label="Slug"
        rules={[
          {
            required: true,
            message: 'Please input the slug!',
          },
          {
            pattern: checker,
            message: 'Please enter valid slug!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="site_title" label="Title">
        <Input />
      </Form.Item>
      <Form.Item name="tag_line" label="Tag line">
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <ReactQuill theme="snow" style={{ width: 500 }} />
      </Form.Item>
      <Form.Item name="site_address" label="Website">
        <Input />
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SpaceCreateForm;
