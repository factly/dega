import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Collapse, Form, Input, Row, Select, Col, ConfigProvider } from 'antd';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';
import { SlugInput } from '../../../components/FormItems';

const { Option } = Select;
const { TextArea } = Input;

const WebsiteEditForm = ({ onCreate, data = {} }) => {
  if (data && data.meta_fields) {
    if (typeof data.meta_fields !== 'string') {
      data.meta_fields = JSON.stringify(data.meta_fields);
    }
  }
  const [form] = Form.useForm();
  const orgs = useSelector((state) => state.spaces.orgs);
  const currentSpaceID = useSelector((state) => state.spaces.selected);

  const [valueChange, setValueChange] = React.useState(false);
  const { Panel } = Collapse;
  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            colorBgContainer: '#F9FAFB',
            colorText: '#000000E0',
          },
        },
      }}
    >
      <Form
        layout="vertical"
        form={form}
        className="edit-form"
        initialValues={{ ...data, space_id: currentSpaceID }}
        name="create-space"
        onFinish={(values) => {
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
          onCreate(values);
        }}
        scrollToFirstError={true}
        onValuesChange={() => {
          setValueChange(true);
        }}
      >
        <Row justify="end">
          <Form.Item>
            <Button disabled={!valueChange} type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Row>
        <Collapse
          expandIconPosition="right"
          expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
          defaultActiveKey={['1']}
          style={{ width: '100%', background: '#f0f2f5', border: 0 }}
        >
          <Panel header="Title and Description" key="1">
            <Row style={{ background: '#F9FAFB', marginBottom: '1rem', gap: '1rem' }}>
              <Col xs={24} md={10}>
                <Form.Item
                  name="organisation_id"
                  label="Organisation"
                  rules={[{ required: true, message: 'Organisation is required' }]}
                >
                  <Select placeholder="Select organisation" disabled>
                    {orgs.map((org) => (
                      <Option key={org.id} value={org.id}>
                        {org.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item rules={[{ required: true }]} name="space_id" label="SpaceID">
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[
                    { required: true, message: 'Name is required' },
                    { min: 3, message: 'Name must be minimum 3 characters.' },
                    { max: 50, message: 'Name must be maximum 50 characters.' },
                  ]}
                >
                  <Input placeholder="Input name" />
                </Form.Item>
                <Form.Item name="site_title" label="Title">
                  <Input />
                </Form.Item>
                <Form.Item name="tag_line" label="Tag line">
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <TextArea placeholder="Enter Description..." />
                </Form.Item>
                <SlugInput />
                <Form.Item name="site_address" label="Site Address">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>
        <Collapse
          expandIconPosition="right"
          expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
          style={{
            width: '100%',
            background: '#f0f2f5',
            border: 0,
            marginTop: '1rem',
          }}
        >
          <Panel header="Meta Fields" key="1">
            <Form.Item name="meta_fields" label="Metafields">
              <MonacoEditor language="json" width="100%" />
            </Form.Item>
          </Panel>
        </Collapse>
      </Form>
    </ConfigProvider>
  );
};

export default WebsiteEditForm;
