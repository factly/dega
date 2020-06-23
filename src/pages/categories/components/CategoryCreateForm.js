import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import { maker, checker } from './../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import Selector from '../../../components/Selector';

const { TextArea } = Input;

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

const CategoryCreateForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();

  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const [mediaSelector, setMediaSelector] = React.useState(false);

  const setMediumValues = (value) => {
    form.setFieldsValue({
      medium: value,
    });
  };

  return (
    <Form
      {...layout}
      form={form}
      initialValues={{ ...data }}
      name="create-category"
      onFinish={(values) => {
        onCreate({ ...values, medium_id: values.medium ? values.medium.id : null });
        onReset();
      }}
    >
      <Form.Item name="parent_id" label="Parent Category">
        <Selector
          action="Categories"
          defaultIds={[]}
          onBlur={(values) => form.setFieldsValue({ parent_id: values })}
        />
      </Form.Item>
      <Form.Item
        name="name"
        label="Category Name"
        rules={[
          {
            required: true,
            message: 'Please enter the name!',
          },
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
            message: 'Slug can not have whitespaces!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[
          {
            required: true,
            message: 'Please input the description!',
          },
        ]}
      >
        <TextArea />
      </Form.Item>
      <MediaSelector
        show={mediaSelector}
        handleCancel={() => setMediaSelector(false)}
        handleSelect={(value) => {
          setMediumValues(value);
          setMediaSelector(false);
        }}
      />
      <Form.Item label="Upload Media" name="medium">
        <Space direction="vertical">
          {form.getFieldValue('medium') ? (
            <img
              src={form.getFieldValue('medium').url}
              alt={form.getFieldValue('medium').alt_text}
              width="100%"
            />
          ) : null}
          <Button onClick={() => setMediaSelector(true)}>Select</Button>
        </Space>
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

export default CategoryCreateForm;
