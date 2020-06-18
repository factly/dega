import React from 'react';
import { Row, Col, Form, Input, Select, Typography } from 'antd';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';

function CreatePost() {
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

  return (
    <Form style={{ maxWidth: '100%', width: '100%' }}>
      <Row gutter={16}>
        <Col span={18}>
          <Form.Item>
            <Input placeholder="title" />
          </Form.Item>
          <Form.Item>
            <Input.TextArea rows={4} placeholder="excerpt" />
          </Form.Item>
          <div id="editorjs"></div>
        </Col>
        <Col span={6}>
          <Form.Item>
            <Select
              defaultValue={['lucy']}
              mode="multiple"
              onPopupScroll={(e) =>
                console.log(e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight)
              }
            >
              <Select.Option value="jack">Jack</Select.Option>
              <Select.Option value="lucy">Lucy</Select.Option>
              <Select.Option value="Yiminghe">yiminghe</Select.Option>
              <Select.Option value="jack1">Jack</Select.Option>
              <Select.Option value="lucy1">Lucy</Select.Option>
              <Select.Option value="Yiminghe1">yiminghe</Select.Option>
              <Select.Option value="jack2">Jack</Select.Option>
              <Select.Option value="lucy2">Lucy</Select.Option>
              <Select.Option value="Yiminghe2">yiminghe</Select.Option>
              <Select.Option value="jack3">Jack</Select.Option>
              <Select.Option value="lucy3">Lucy</Select.Option>
              <Select.Option value="Yiminghe3">yiminghe</Select.Option>
              <Select.Option value="jack4">Jack</Select.Option>
              <Select.Option value="lucy4">Lucy</Select.Option>
              <Select.Option value="Yiminghe4">yiminghe</Select.Option>
              <Select.Option value="jack5">Jack</Select.Option>
              <Select.Option value="lucy5">Lucy</Select.Option>
              <Select.Option value="Yiminghe5">yiminghe</Select.Option>
              <Select.Option value="jack6">Jack</Select.Option>
              <Select.Option value="lucy6">Lucy</Select.Option>
              <Select.Option value="Yiminghe6">yiminghe</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default CreatePost;
