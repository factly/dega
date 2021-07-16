import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import Editor from '../../../components/Editor';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';

const { TextArea } = Input;

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

const ClaimantForm = ({ onCreate, data = {} }) => {
  if (data && data.meta_fields) {
    if (typeof data.meta_fields !== 'string') {
      data.meta_fields = JSON.stringify(data.meta_fields);
    }
  }
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);

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
      initialValues={{ ...data }}
      name="creat-claimant"
      onFinish={(values) => {
        if (values.meta_fields) {
          values.meta_fields = getJsonValue(values.meta_fields);
        }
        onCreate(values);
        onReset();
      }}
      onValuesChange={() => {
        setValueChange(true);
      }}
    >
      <Form.Item
        name="name"
        label="Claimant"
        rules={[
          {
            required: true,
            message: 'Please enter the name!',
          },
          { min: 3, message: 'Name must be minimum 3 characters.' },
          { max: 50, message: 'Name must be maximum 50 characters.' },
        ]}
      >
        <Input onChange={(e) => onTitleChange(e.target.value)} />
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

      <Form.Item name="tag_line" label="Tag Line">
        <TextArea />
      </Form.Item>
      <Form.Item label="Featured Image" name="medium_id">
        <MediaSelector />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Editor style={{ width: '600px' }} placeholder="Enter Description..." />
      </Form.Item>
      <Form.Item name="meta_fields" label="Metafields">
        <MonacoEditor language="json" />
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

export default ClaimantForm;
