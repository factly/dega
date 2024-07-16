import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Form, Input, Select, Row, Col, ConfigProvider } from 'antd';
import { maker } from './../../../utils/sluger';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';
import { SlugInput } from '../../../components/FormItems';

const { Option } = Select;
const { TextArea } = Input;

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
    <ConfigProvider
      theme={{
        components: {
          Form: {
            marginLG: 12,
          },
        },
      }}
    >
      <Form
        form={form}
        name="create-space"
        layout="vertical"
        onFinish={(values) => {
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
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
                    {orgs.filter(o => o.role === 'admin').map((org) => (
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
            <SlugInput />
            <Form.Item name="site_title" label="Title">
              <Input />
            </Form.Item>
            <Form.Item name="tag_line" label="Tag line">
              <Input />
            </Form.Item>
            <Form.Item name="site_address" label="Website">
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <TextArea placeholder="Enter Description..." />
            </Form.Item>
            <Form.Item name="meta_fields" label="Metafields">
              <MonacoEditor width="100%" language="json" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
      </Form>
    </ConfigProvider>
  );
};

export default SpaceCreateForm;
