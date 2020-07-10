import React from 'react';
import { Row, Col, Form, Input, Button, Space, Statistic } from 'antd';
import MediaSelector from '../../../components/MediaSelector';
import Selector from '../../../components/Selector';
import Editor from '../../../components/Editor';
import { maker, checker } from '../../../utils/sluger';
import moment from 'moment';
import { SaveOutlined, ToTopOutlined } from '@ant-design/icons';

function CreateFactCheck({ onCreate, data = {} }) {
  const [form] = Form.useForm();

  const onSave = (values) => {
    values.author_ids = values.authors || [];
    values.category_ids = values.categories || [];
    values.tag_ids = values.tags || [];
    values.claim_ids = values.claims || [];
    values.published_date = moment().format('YYYY-MM-DDTHH:mm:ssZ');

    onCreate(values);
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  return (
    <Form
      form={form}
      initialValues={{ ...data }}
      style={{ maxWidth: '100%', width: '100%' }}
      onFinish={(values) => onSave(values)}
      layout="vertical"
    >
      <Space direction="vertical">
        <Form.Item name="status" style={{ float: 'right' }}>
          <Input.Group compact>
            <Button
              type="secondary"
              htmlType="submit"
              icon={<SaveOutlined />}
              onClick={() =>
                form.setFieldsValue({
                  status: 'Draft',
                })
              }
            >
              Draft
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              icon={<ToTopOutlined />}
              onClick={() =>
                form.setFieldsValue({
                  status: 'Publish',
                })
              }
            >
              Publish
            </Button>
          </Input.Group>
        </Form.Item>
        <Row gutter={16}>
          <Col span={18}>
            <Form.Item
              name="title"
              label="Title"
              rules={[
                {
                  required: true,
                  message: 'Please input the title!',
                },
              ]}
            >
              <Input placeholder="title" onChange={(e) => onTitleChange(e.target.value)} />
            </Form.Item>
            <Form.Item name="excerpt" label="Excerpt">
              <Input.TextArea rows={4} placeholder="excerpt" />
            </Form.Item>
            <Form.Item name="claims" label="Claims">
              <Selector mode="multiple" display={'title'} action="Claims" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Editor />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Status" name="status">
              {data.status ? <Statistic /> : null}
            </Form.Item>
            <Form.Item name="featured_medium_id" label="Image">
              <MediaSelector />
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
            <Form.Item name="categories" label="Categories">
              <Selector mode="multiple" action="Categories" />
            </Form.Item>
            <Form.Item name="tags" label="Tags">
              <Selector mode="multiple" action="Tags" />
            </Form.Item>
            <Form.Item name="authors" label="Authors">
              <Selector mode="multiple" display={'email'} action="Authors" />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Col>
        </Row>
      </Space>
    </Form>
  );
}

export default CreateFactCheck;
