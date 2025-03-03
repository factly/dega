import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const RelatedURLs = ({ name = 'related_urls', label = 'Related URLs' }) => {
  return (
    <Form.List name={name} label={label}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }, index) => (
            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <Form.Item
                {...restField}
                name={name}
                rules={[
                  { required: true, message: 'Missing URL' },
                  { type: 'url', message: 'Please enter a valid URL' },
                ]}
              >
                <Input placeholder="https://example.com" style={{ width: '300px' }} />
              </Form.Item>
              <MinusCircleOutlined onClick={() => remove(name)} />
            </Space>
          ))}
          <Form.Item>
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              Add Related URL
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};

export default RelatedURLs;
