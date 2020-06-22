import React from 'react';
import { Row, Col, Form, Input, Button, Typography } from 'antd';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
import Selector from '../../components/Selector';

function CreatePost() {
  const [form] = Form.useForm();

  const editor = new EditorJS({
    /**
     * Id of Element that should contain the Editor
     */

    holder: 'editorjs',

    /**
     * Available Tools list.
     * Pass Tool's class or Settings object for each Tool you want to use
     */

    tools: {
      header: Header,
      list: List,
      paragraph: Paragraph,
      quote: Quote,
      table: Table,
    },
  });

  const onFinish = (values) => console.log(values)

  return (
    <Form form={form} style={{ maxWidth: '100%', width: '100%' }} onFinish={onFinish}>
      <Row gutter={16}>
        <Col span={18}>
          <Form.Item name="title" label="Title"> 
            <Input placeholder="title" />
          </Form.Item>
          <Form.Item name="excerpt" label="Excerpt">
            <Input.TextArea rows={4} placeholder="excerpt" />
          </Form.Item>
          <div id="editorjs"></div>
        </Col>
        <Col span={6}>
          <Form.Item name="categories">
            <Typography.Text> Categories</Typography.Text>
            <Selector mode="multiple" action="Categories" onBlur={(values) => form.setFieldsValue({tags:values})}/>
          </Form.Item>
          <Form.Item name="tags">
            <Typography.Text> Tags</Typography.Text>
            <Selector mode="multiple" action="Tags" onBlur={(values) => form.setFieldsValue({categories:values})}/>
          </Form.Item>
          <Form.Item name="formats">
            <Typography.Text> Formats </Typography.Text>
            <Selector action="Formats" onBlur={(values) => form.setFieldsValue({formats:values})}/>
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default CreatePost;
