import React, { useState } from 'react';
import { Row, Col, Button, Form, Input, Space, Switch, Collapse } from 'antd';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import Editor from '../../../components/Editor';
import Selector from '../../../components/Selector';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';
import SocialCardPreview from '../../../components/PreviewSocialCard';
import { useSelector } from 'react-redux';
import Breadcrumb from '../../../components/Breadcrumb';
import routes from '../../../config/routesConfig';

const CategoryForm = ({ onCreate, data = {} }) => {
  const siteAddress = useSelector(
    ({ spaces: { details, selected } }) => details[selected].site_address,
  );

  if (data && data.meta_fields) {
    if (typeof data.meta_fields !== 'string') {
      data.meta_fields = JSON.stringify(data.meta_fields);
    }
  }
  const [formData, setFormData] = useState(data);
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);

  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (title) => {
    const slug = maker(title);
    const values = {
      slug: slug,
      meta: {
        facebook: {
          title: title,
          canonical_URL: slug,
        },
        twitter: {
          title: title,
          canonical_URL: slug,
        },
        google: {
          title: title,
          canonical_URL: slug,
        },
      },
    };
    form.setFieldsValue(values);
    setFormData(form.getFieldValue());
  };

  return (
    <>
      <Breadcrumb
        path={
          routes.categories.path +
          '/' +
          `${
            data.id
              ? form.getFieldValue('name') || ''
              : form.getFieldValue('name') || routes.createCategory.title
          }`
        }
      />
      <Form
        form={form}
        initialValues={{ ...data }}
        name="create-category"
        layout="vertical"
        onFinish={(values) => {
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
          onCreate(values);
          onReset();
        }}
        onValuesChange={(changedFields, allFields) => {
          setValueChange(true);
          setFormData(allFields);
        }}
      >
        <Row justify="center" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Col span={24}>
            <Row justify="end" gutter={40}>
              <Form.Item>
                <Space>
                  <Button htmlType="button" onClick={onReset}>
                    Reset
                  </Button>
                  <Button disabled={!valueChange} type="primary" htmlType="submit">
                    {data && data.id ? 'Update' : 'Submit'}
                  </Button>
                </Space>
              </Form.Item>
            </Row>
          </Col>
          <Col span={24}>
            <Row
              gutter={40}
              justify="space-around"
              style={{ background: '#f0f2f5', padding: '1.25rem', marginBottom: '1rem' }}
            >
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Category Name"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter the name!',
                    },
                    { min: 3, message: 'Name must be minimum 3 characters.' },
                    { max: 50, message: 'Name must be maximum 50 characters.' },
                  ]}
                >
                  <Input onChange={(e) => onTitleChange(e.target.value)} />
                </Form.Item>
                <Row gutter={40}>
                  <Col md={{ span: 16 }}>
                    <Form.Item name="parent_id" label="Parent Category">
                      <Selector action="Categories" />
                    </Form.Item>
                  </Col>
                  <Col md={{ span: 5 }}>
                    <Form.Item label="Featured" name="is_featured" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
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
                  <Input
                    onChange={(e) =>
                      form.setFieldsValue({
                        meta: {
                          facebook: {
                            canonical_URL: e.target.value,
                          },
                          google: {
                            canonical_URL: e.target.value,
                          },
                          twitter: {
                            canonical_URL: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label="Featured Image" name="medium_id">
                  <MediaSelector maxWidth={'350px'} containerStyles={{ justifyContent: 'start' }} />
                </Form.Item>
              </Col>
              <Col span={12} style={{ marginRight: 'auto', marginLeft: '20px' }}>
                <Form.Item name="description" label="Description">
                  <Editor
                    style={{ width: '600px', background: '#fff', padding: '0.5rem 0.75rem' }}
                    placeholder="Enter Description..."
                    basic={true}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={40} style={{ background: '#f0f2f5' }}>
              <Collapse
                expandIconPosition="right"
                expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
                style={{ width: '100%' }}
              >
                <Collapse.Panel header="Meta Data" className="meta-data-container">
                  <div className="preview-form-container">
                    <Form.Item name={['meta', 'title']} label="Meta Title">
                      <Input
                        defaultValue={
                          form.getFieldValue(['meta', 'title']) || form.getFieldValue('name')
                        }
                      />
                    </Form.Item>
                    <Form.Item name={['meta', 'description']} label="Meta Description">
                      <Input.TextArea />
                    </Form.Item>
                    <Form.Item name={['meta', 'canonical_URL']} label="Canonical URL">
                      <Input
                        addonBefore={siteAddress ? siteAddress + '/' : 'http://example.factly.in/'}
                        defaultValue={
                          form.getFieldValue(['meta', 'canonical_URL']) ||
                          form.getFieldValue('slug') ||
                          ''
                        }
                        style={{ minWidth: '30ch' }}
                      />
                    </Form.Item>
                  </div>
                  <SocialCardPreview type="google" siteAddress={siteAddress} formData={formData} />
                </Collapse.Panel>
                <Collapse.Panel header="Twitter Card" className="meta-data-container">
                  <div className="preview-form-container">
                    {/* <Form.Item label="Twitter Image" name={'medium_id'}>
                    <MediaSelector
                      maxWidth={'350px'}
                      containerStyles={{ justifyContent: 'start' }}
                    />
                  </Form.Item> */}
                    <Form.Item name={['meta', 'twitter', 'title']} label="Meta Title">
                      <Input
                        defaultValue={
                          form.getFieldValue(['meta', 'twitter', 'title']) ||
                          form.getFieldValue('name')
                        }
                      />
                    </Form.Item>
                    <Form.Item name={['meta', 'twitter', 'description']} label="Meta Description">
                      <Input.TextArea />
                    </Form.Item>
                    <Form.Item name={['meta', 'twitter', 'canonical_URL']} label="Canonical URL">
                      <Input
                        addonBefore={siteAddress ? siteAddress + '/' : 'http://example.factly.in/'}
                        defaultValue={
                          form.getFieldValue(['meta', 'twitter', 'canonical_URL']) ||
                          form.getFieldValue('slug') ||
                          ''
                        }
                        style={{ minWidth: '30ch' }}
                      />
                    </Form.Item>
                  </div>
                  <SocialCardPreview
                    type="twitter"
                    formData={formData}
                    siteAddress={siteAddress}
                    image={form.getFieldValue('medium_id')}
                  />
                </Collapse.Panel>
                <Collapse.Panel header="Facebook Card" className="meta-data-container">
                  <div className="preview-form-container">
                    {/* <Form.Item label="Facebook Image" name={'medium_id'}>
                    <MediaSelector
                      maxWidth={'350px'}
                      containerStyles={{ justifyContent: 'start' }}
                    />
                  </Form.Item> */}
                    <Form.Item name={['meta', 'facebook', 'title']} label="Meta Title">
                      <Input
                        defaultValue={
                          form.getFieldValue(['meta', 'facebook', 'title']) ||
                          form.getFieldValue('name')
                        }
                      />
                    </Form.Item>
                    <Form.Item name={['meta', 'facebook', 'description']} label="Meta Description">
                      <Input.TextArea />
                    </Form.Item>
                    <Form.Item name={['meta', 'facebook', 'canonical_URL']} label="Canonical URL">
                      <Input
                        addonBefore={siteAddress ? siteAddress + '/' : 'http://example.factly.in/'}
                        defaultValue={
                          form.getFieldValue(['meta', 'facebook', 'canonical_URL']) ||
                          form.getFieldValue('slug') ||
                          ''
                        }
                        style={{ minWidth: '30ch' }}
                      />
                    </Form.Item>
                  </div>
                  <SocialCardPreview
                    type="fb"
                    formData={formData}
                    siteAddress={siteAddress}
                    image={form.getFieldValue('medium_id')}
                  />
                </Collapse.Panel>
              </Collapse>
              <Collapse
                expandIconPosition="right"
                expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
                style={{ width: '100%' }}
              >
                <Collapse.Panel header="Code Injection">
                  <Form.Item name="header_code" label="Header Code">
                    <MonacoEditor language="html" width="100%" />
                  </Form.Item>
                  <Form.Item name="footer_code" label="Footer Code">
                    <MonacoEditor language="html" width="100%" />
                  </Form.Item>
                </Collapse.Panel>
              </Collapse>
              <Collapse
                expandIconPosition="right"
                expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
                style={{ width: '100%' }}
              >
                <Collapse.Panel header="Meta Fields">
                  <Form.Item name="meta_fields">
                    <MonacoEditor language="json" width="100%" />
                  </Form.Item>
                </Collapse.Panel>
              </Collapse>
            </Row>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default CategoryForm;
