import React, { useState } from 'react';
import { Button, Col, Collapse, Form, Input, Row, Skeleton } from 'antd';

import MediaSelector from '../../components/MediaSelector/index';
import { useSelector, useDispatch } from 'react-redux';
import { updateSpace } from '../../actions/spaces';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';

function Branding() {
  const { Panel } = Collapse;
  const id = useSelector((state) => state.spaces.selected);
  const dispatch = useDispatch();
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

  const [form] = Form.useForm();

  const onReset = () => {
    form.resetFields();
  };
  //! More Descriptive favicons and logo fields
  return (
    <div>
      <Form
        layout="vertical"
        form={form}
        initialValues={space}
        name="create-space"
        onFinish={(values) => {
          onCreate(values);
          onReset();
        }}
        scrollToFirstError={true}
        onFinishFailed={(errors) => {
          //let name = errors.errorFields[0].name[0];
          // if (['name', 'slug'].includes(name)) {
          console.log({ errors });
          // }
        }}
        onValuesChange={() => {
          setValueChange(true);
        }}
        style={{
          paddingTop: '24px',
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
          style={{ width: '100%' }}
        >
          <Panel header="Icons and Logos" key="1">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Logo" name="logo_id" extra="Primary Logo">
                  <MediaSelector
                    containerStyles={{ justifyContent: 'flex-start', maxWidth: '192px' }}
                    maxWidth="192px"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Logo Mobile"
                  name="logo_mobile_id"
                  extra="Secondary logo for mobile sites or amp pages"
                >
                  <MediaSelector
                    containerStyles={{ justifyContent: 'flex-start', maxWidth: '192px' }}
                    maxWidth="192px"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Fav Icon"
                  name="fav_icon_id"
                  extra="Default favicon for browsers and pwa sites"
                >
                  <MediaSelector
                    containerStyles={{ justifyContent: 'flex-start', maxWidth: '192px' }}
                    maxWidth="192px"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Mobile Icon"
                  name="mobile_icon_id"
                  extra="Favicon for mobile and pwa sites"
                >
                  <MediaSelector
                    containerStyles={{ justifyContent: 'flex-start', maxWidth: '192px' }}
                    maxWidth="192px"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
          <Panel header="Social Accounts" key="2">
            <Form.Item name={['social_media_urls', 'facebook']} label="Facebook">
              <Input
                style={{ width: '100%' }}
                placeholder="https://www.facebook.com/pages/factly"
              />
            </Form.Item>
            <Form.Item name={['social_media_urls', 'twitter']} label="Twitter">
              <Input style={{ width: '100%' }} placeholder="https://www.twitter.com/users/factly" />
            </Form.Item>
            <Form.Item name={['social_media_urls', 'pintrest']} label="Pintrest">
              <Input
                style={{ width: '100%' }}
                placeholder="https://www.pinterest.com/pages/factly"
              />
            </Form.Item>
            <Form.Item name={['social_media_urls', 'instagram']} label="Instagram">
              <Input
                style={{ width: '100%' }}
                placeholder="https://www.instagram.com/pages/factly"
              />
            </Form.Item>
          </Panel>
        </Collapse>
      </Form>
    </div>
  );
}

export default Branding;
