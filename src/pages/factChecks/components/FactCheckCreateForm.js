import React from 'react';
import { Row, Col, Form, Input, Button } from 'antd';
import MediaSelector from '../../../components/MediaSelector';
import Selector from '../../../components/Selector';
import Editor from '../../../components/Editor';
import { maker, checker } from '../../../utils/sluger';
import moment from 'moment';

function CreateFactCheck({ onCreate, data = {} }) {
  const [form] = Form.useForm();

  const onSave = (values) => {
    values.author_ids = values.authors || [];
    values.category_ids = values.categories || [];
    values.tag_ids = values.tags || [];
    values.claim_ids = values.claims || [];
    values.status = 'save';
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
      <Row gutter={16}>
        <Col span={18}>
          <Form.Item name="title" label="Title">
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
                message: 'Slug can not have whitespaces!',
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
    </Form>
  );
}

export default CreateFactCheck;
