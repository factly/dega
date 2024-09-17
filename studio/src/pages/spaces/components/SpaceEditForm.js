import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Form, Input, Select, Row } from 'antd';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';
import { SlugInput } from '../../../components/FormItems';

const { Option } = Select;
const { TextArea } = Input;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 8,
  },
};

const SpaceEditForm = ({ onCreate, data = {} }) => {
  if (data && data.meta_fields) {
    if (typeof data.meta_fields !== 'string') {
      data.meta_fields = JSON.stringify(data.meta_fields);
    }
  }
  const [form] = Form.useForm();
  const orgs = useSelector((state) => state.spaces.orgs);

  const [valueChange, setValueChange] = React.useState(false);

  return (
    <div>
      <Form
        {...layout}
        form={form}
        initialValues={data}
        name="create-space"
        onFinish={(values) => {
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
          onCreate(values);
        }}
        scrollToFirstError={true}
        onValuesChange={() => {
          setValueChange(true);
        }}
        style={{
          paddingTop: '24px',
        }}
      >
        <Row justify="end">
          <Form.Item>
            <Button disabled={!valueChange} type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Row>
        <Form.Item label="Name">
          <Input.Group compact>
            <Form.Item
              name="organisation_id"
              noStyle
              rules={[{ required: true, message: 'Organisation is required' }]}
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
              <Input style={{ width: '60%' }} placeholder="Input name" />
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
          <MonacoEditor language="json" />
        </Form.Item>
      </Form>
    </div>
  );
};

export default SpaceEditForm;
