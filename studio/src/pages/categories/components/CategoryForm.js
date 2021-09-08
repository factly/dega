import React, { useState } from 'react';
import { Row, Col, Button, Form, Input, Space, Switch } from 'antd';
import { maker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import Selector from '../../../components/Selector';
import getJsonValue from '../../../utils/getJsonValue';
import { useSelector } from 'react-redux';

import { DescriptionInput, MetaForm, SlugInput, TitleInput } from '../../../components/FormItems';

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
        canonical_URL: slug,
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
              <TitleInput
                name="name"
                label="Category Name"
                onChange={(e) => onTitleChange(e.target.value)}
              />

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
              <SlugInput
                onChange={(e) =>
                  form.setFieldsValue({
                    meta: {
                      canonical_URL: e.target.value,
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
            </Col>
            <Col span={10}>
              <Form.Item label="Featured Image" name="medium_id">
                <MediaSelector maxWidth={'350px'} containerStyles={{ justifyContent: 'start' }} />
              </Form.Item>
            </Col>
            <Col span={12} style={{ marginRight: 'auto', marginLeft: '20px' }}>
              <DescriptionInput
                inputProps={{
                  style: { width: '600px', background: '#fff', padding: '0.5rem 0.75rem' },
                  placeholder: 'Enter Description...',
                  basic: true,
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row gutter={40} style={{ background: '#f0f2f5' }}>
            <MetaForm form={form} formData={formData} />
          </Row>
        </Col>
      </Row>
    </Form>
  );
};

export default CategoryForm;
