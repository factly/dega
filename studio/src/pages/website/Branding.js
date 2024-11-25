import React, { useState } from 'react';
import { Button, Col, Collapse, Form, Input, Row, Skeleton, ConfigProvider } from 'antd';

import MediaSelector from '../../components/MediaSelector/index';
import { useSelector, useDispatch } from 'react-redux';
import { updateSpace } from '../../actions/spaces';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';

function Branding() {
  const { Panel } = Collapse;
  const id = useSelector((state) => state.spaces.selected);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = useState(false);

  const { space, loading } = useSelector((state) => {
    return {
      space: state.spaces.details[id],
      loading: state.spaces.loading,
    };
  });

  const onCreate = (values) => {
    dispatch(updateSpace({ ...space, ...values }));
  };

  if (loading) return <Skeleton />;

  if (!space) {
    return <RecordNotFound />;
  }

  //! More Descriptive favicons and logo fields
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
      <Helmet title={'Branding'} />
      <Form
        layout="vertical"
        form={form}
        initialValues={space}
        name="create-space"
        onFinish={(values) => {
          onCreate(values);
        }}
        className="edit-form"
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
          style={{ width: '100%', background: '#f0f2f5', border: 0 }}
          defaultActiveKey={['1']}
        >
          <Panel header="Icons and Logos" key="1">
            <Row gutter={[48, 16]}>
              <Col xs={24} md={5}>
                <Form.Item label="Primary Logo" name="logo_id" extra="Primary Logo">
                  <MediaSelector
                    containerStyles={{
                      justifyContent: 'flex-start',
                      maxWidth: '100%',
                      margin: '8px 0',
                    }}
                    maxWidth="100%"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={5}>
                <Form.Item
                  label="Logo Mobile"
                  name="logo_mobile_id"
                  extra="Secondary logo for mobile sites or amp pages"
                >
                  <MediaSelector
                    containerStyles={{
                      justifyContent: 'flex-start',
                      maxWidth: '100%',
                      margin: '8px 0',
                    }}
                    maxWidth="100%"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={5}>
                <Form.Item
                  label="Fav Icon"
                  name="fav_icon_id"
                  extra="Default favicon for browsers and pwa sites"
                >
                  <MediaSelector
                    containerStyles={{
                      justifyContent: 'flex-start',
                      maxWidth: '100%',
                      margin: '8px 0',
                    }}
                    maxWidth="100%"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={5}>
                <Form.Item
                  label="Mobile Icon"
                  name="mobile_icon_id"
                  extra="Favicon for mobile and pwa sites"
                >
                  <MediaSelector
                    containerStyles={{
                      justifyContent: 'flex-start',
                      maxWidth: '100%',
                      margin: '8px 0',
                    }}
                    maxWidth="100%"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>
        <Collapse
          expandIconPosition="right"
          expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
          style={{ width: '100%', background: '#f0f2f5', border: 0, marginTop: 16 }}
        >
          <Panel header="Social Accounts" key="1">
            <Row style={{ background: '#F9FAFB', marginBottom: '1rem', gap: '1rem' }}>
              <Col xs={24} md={10}>
                <Form.Item name={['social_media_urls', 'facebook']} label="Facebook">
                  <Input
                    style={{ width: '100%' }}
                    placeholder="https://www.facebook.com/pages/factly"
                  />
                </Form.Item>
                <Form.Item name={['social_media_urls', 'twitter']} label="Twitter">
                  <Input
                    style={{ width: '100%' }}
                    placeholder="https://www.twitter.com/users/factly"
                  />
                </Form.Item>
                <Form.Item name={['social_media_urls', 'instagram']} label="Instagram">
                  <Input
                    style={{ width: '100%' }}
                    placeholder="https://www.instagram.com/pages/factly"
                  />
                </Form.Item>
                <Form.Item name={['social_media_urls', 'github']} label="Github">
                  <Input style={{ width: '100%' }} placeholder="https://github.com/factly/" />
                </Form.Item>
                <Form.Item name={['social_media_urls', 'youtube']} label="Youtube">
                  <Input
                    style={{ width: '100%' }}
                    placeholder="https://www.youtube.com/c/Factlyindia"
                  />
                </Form.Item>
                <Form.Item name={['social_media_urls', 'linkedin']} label="Linkedin">
                  <Input
                    style={{ width: '100%' }}
                    placeholder="https://www.linkedin.com/company/factlyindia/"
                  />
                </Form.Item>
                <Form.Item name={['social_media_urls', 'pinterest']} label="Pinterest">
                  <Input
                    style={{ width: '100%' }}
                    placeholder="https://www.pinterest.com/pages/factly"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </Form>
    </ConfigProvider>
  );
}

export default Branding;
