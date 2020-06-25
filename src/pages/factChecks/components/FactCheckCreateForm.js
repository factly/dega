import React from 'react';
import { Row, Col, Form, Input, Button } from 'antd';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
import Selector from '../../../components/Selector';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import moment from 'moment';

function CreateFactCheck({ onCreate, data = {} }) {
  const [form] = Form.useForm();

  const editor = new EditorJS({
    holder: 'post',
    tools: {
      header: Header,
      list: List,
      paragraph: Paragraph,
      quote: Quote,
      table: Table,
    },
    data: data.description,
  });

  const onSave = (values) => {
    editor
      .save()
      .then((outputData) => {
        values.category_ids = values.categories || [];
        values.tag_ids = values.tags || [];
        values.claim_ids = values.claims || [];
        values.status = 'save';
        values.published_date = moment().format('YYYY-MM-DDTHH:mm:ssZ');

        onCreate({
          ...values,
          description: outputData,
        });
      })
      .catch((error) => {
        console.log('Saving failed: ', error);
      });
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
          <Form.Item label="Description">
            <div id="post" style={{ border: '1px solid black' }}></div>
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
