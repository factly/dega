import React from 'react';
import { Button, Form, InputNumber, Space, Select, Input, ConfigProvider, Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { TitleInput } from '../../../../components/FormItems';

const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

const RequestForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();

  const onReset = () => {
    form.resetFields();
  };

  const orgs = useSelector(({ spaces }) => spaces.orgs);

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
        initialValues={{ ...data }}
        name="create-category"
        onFinish={(values) => {
          onCreate(values);
          onReset();
        }}
      >
        <Row justify="space-between">
          <Col md={8} xs={24}>
            <TitleInput />
            <Form.Item name="organisation_id" label="Organisation">
              <Select
                allowClear
                bordered
                listHeight={128}
                defaultValue={[]}
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {orgs.map((item) => (
                  <Select.Option value={item.id} key={item.id}>
                    {item.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="spaces"
              label="Spaces"
              rules={[
                {
                  required: true,
                  message: 'Please enter the numeric value!',
                },
              ]}
            >
              <InputNumber min={-1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} />
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
