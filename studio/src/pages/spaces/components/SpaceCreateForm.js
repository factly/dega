import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Form, Input, Select, ConfigProvider, Typography } from 'antd';
import { maker } from './../../../utils/sluger';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';
import { SlugInput } from '../../../components/FormItems';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const SpaceCreateForm = ({ onCreate }) => {
  const [form] = Form.useForm();
  const orgs = useSelector((state) => state.spaces.orgs);

  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const formItemWidth = { maxWidth: '500px' };

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            marginLG: 24,
          },
        },
      }}
    >
      <div className="stats-wrapper" style={{ padding: '20px', background: '#f5f5f5' }}>
        {/* Header */}
        <div
          style={{ marginBottom: '20px', borderBottom: '1px solid #e8e8e8', paddingBottom: '12px' }}
        >
          <Title level={2}>Create New Space</Title>
        </div>

        <div className="ant-row" style={{ gap: '20px' }}>
          {/* Form Section */}
          <div style={{ flex: '1', maxWidth: '800px', margin: '0 auto' }}>
            <div
              style={{
                background: '#f5f5f5',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
              }}
            >
              <Form
                form={form}
                name="create-space"
                layout="vertical"
                onFinish={(values) => {
                  if (values.meta_fields) {
                    values.meta_fields = getJsonValue(values.meta_fields);
                  }
                  onCreate(values);
                  onReset();
                }}
                requiredMark={false}
              >
                {/* Basic Information */}
                <div style={{ marginBottom: '12px' }}>
                  <Typography.Title level={4} style={{ marginBottom: '12px' }}>
                    Basic Information
                  </Typography.Title>

                  <Form.Item
                    label="Organization & Name"
                    style={{ marginBottom: '20px', ...formItemWidth }}
                  >
                    <Input.Group compact>
                      <Form.Item
                        name="organisation_id"
                        noStyle
                        rules={[{ required: true, message: 'Organisation is required' }]}
                      >
                        <Select style={{ width: '35%' }} placeholder="Select org" size="middle">
                          {orgs
                            .filter((o) => o.role === 'admin')
                            .map((org) => (
                              <Option key={org.id} value={org.id}>
                                {org.title}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name="name"
                        noStyle
                        rules={[
                          { required: true, message: 'Name is required' },
                          { min: 3, message: 'Min 3 characters' },
                          { max: 30, message: 'Max 30 characters' },
                        ]}
                      >
                        <Input
                          style={{ width: '65%' }}
                          placeholder="Space name"
                          onChange={(e) => onTitleChange(e.target.value)}
                          size="middle"
                          maxLength={30}
                        />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>

                  <Form.Item style={{ ...formItemWidth, marginBottom: '4px' }}>
                    <SlugInput />
                  </Form.Item>
                </div>

                {/* Site Details */}
                <div style={{ marginBottom: '16px' }}>
                  <Typography.Title level={4} style={{ marginBottom: '20px' }}>
                    Site Details
                  </Typography.Title>

                  <Form.Item name="site_title" label="Site Title" style={formItemWidth}>
                    <Input size="middle" placeholder="Enter site title" maxLength={50} />
                  </Form.Item>

                  <Form.Item name="tag_line" label="Tagline" style={formItemWidth}>
                    <Input size="middle" placeholder="Enter tagline" maxLength={100} />
                  </Form.Item>

                  <Form.Item name="site_address" label="Website URL" style={formItemWidth}>
                    <Input size="middle" placeholder="example.com" addonBefore="https://" />
                  </Form.Item>
                </div>

                {/* Content Section */}
                <div style={{ marginBottom: '32px' }}>
                  <Typography.Title level={4} style={{ marginBottom: '20px' }}>
                    Content
                  </Typography.Title>

                  <Form.Item name="description" label="Description" style={formItemWidth}>
                    <TextArea
                      placeholder="Brief description..."
                      rows={4}
                      maxLength={500}
                      style={{ fontSize: '14px' }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="meta_fields"
                    label="Meta Fields"
                    extra="Add custom metadata in JSON format"
                    style={formItemWidth}
                  >
                    <div
                      style={{
                        border: '1px solid #e8e8e8',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <MonacoEditor
                        width="100%"
                        height="200px"
                        language="json"
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>
                  </Form.Item>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    paddingTop: '20px',
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <Button onClick={onReset} size="middle" style={{ padding: '0 16px' }}>
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="middle"
                    style={{ padding: '0 24px' }}
                  >
                    Create Space
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default SpaceCreateForm;
