import React from 'react';
import { Button, Form, Input, Space, Row, Col, Select } from 'antd';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import Editor from '../../../components/Editor';
import Selector from '../../../components/Selector';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';

const layout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

const { Option } = Select;

const PodcastForm = ({ onCreate, data = {} }) => {
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
      layout="vertical"
      form={form}
      initialValues={{ ...data, language: 'english' }}
      name="create-category"
      onFinish={(values) => {
        if (values.meta_fields) {
          values.meta_fields = getJsonValue(values.meta_fields);
        }
        onCreate({
          ...values,
          category_ids: values.categories || [],
        });
        onReset();
      }}
      onValuesChange={() => {
        setValueChange(true);
      }}
    >
      <Row>
        <Col span={12}>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                message: 'Please enter the title!',
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
          <Form.Item name="language" label="Language">
            <Select defaultValue="english" style={{ width: 120 }}>
              <Option value="english">English</Option>
              <Option value="telugu">Telugu</Option>
            </Select>
          </Form.Item>

          <Form.Item name="categories" label="Categories">
            <Selector mode="multiple" action="Categories" createEntity="Category" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Editor style={{ width: '600px' }} placeholder="Enter Description..." />
          </Form.Item>
          <Form.Item name="meta_fields" label="Metafields">
            <MonacoEditor />
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
        </Col>
        <Col offset={4} span={6}>
          <Form.Item label="Featured Image" name="medium_id">
            <MediaSelector />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default PodcastForm;
