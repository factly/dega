import React from 'react';
import { Button, Form, InputNumber, Space, Switch, Input, Select, ConfigProvider, Row, Col } from 'antd';

import { spaceSelector } from '../../../../selectors/spaces';
import { useSelector } from 'react-redux';
import { TitleInput } from '../../../../components/FormItems';

const RequestForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();

  const onReset = () => {
    form.resetFields();
  };

  const { spaces, loading } = useSelector(spaceSelector);

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            marginLG: 12,
          },
        },
      }}
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={data}
        name="create-category"
        onFinish={(values) => {
          onCreate(values);
          onReset();
        }}
      >
        <Row justify="space-between">
          <Col span={8}>
            <TitleInput />
            <Form.Item
              name="space_id"
              label="Space"
              rules={[
                {
                  required: true,
                  message: 'Please select a space',
                },
              ]}
            >
              <Select
                allowClear
                bordered
                listHeight={128}
                loading={loading}
                defaultValue={[]}
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {spaces.map((item) => (
                  <Select.Option value={item.id} key={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="posts"
              label="Posts"
              rules={[
                {
                  required: true,
                  message: 'Please enter the numeric value!',
                },
              ]}
            >
              <InputNumber min={-1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="episodes"
              label="Episodes"
              rules={[
                {
                  required: true,
                  message: 'Please enter the numeric value!',
                },
              ]}
            >
              <InputNumber min={-1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="media"
              label="Media"
              rules={[
                {
                  required: true,
                  message: 'Please enter the numeric value!',
                },
              ]}
            >
              <InputNumber min={-1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="fact_check" valuePropName="checked">
              <Row justify="space-between">
                <span>Fact Check</span>
                <Switch />
              </Row>
            </Form.Item>
            <Form.Item name="podcast" valuePropName="checked">
              <Row justify="space-between">
                <span>Podcast</span>
                <Switch />
              </Row>
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4}/>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </ConfigProvider>
  );
};

export default RequestForm;
