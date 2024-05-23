import React, { useState } from 'react';
import { Button, Form, Input, Skeleton, Row, Col, ConfigProvider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { updateSpace } from '../../actions/spaces';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';

function AnalyticsForm() {
  const id = useSelector((state) => state.spaces.selected);
  const dispatch = useDispatch();
  const [valueChange, setValueChange] = useState(false);
  const [form] = Form.useForm();

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

  const onReset = () => {
    form.resetFields();
  };
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
      <Helmet title={'Analytics Form'} />
      <Form
        form={form}
        layout="vertical"
        initialValues={space}
        name="create-space"
        onFinish={(values) => {
          onCreate(values);
          //  onReset();
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
      >
        <Row>
          <Col md={8} xs={24}>
            <Form.Item name={['analytics', 'plausible', 'server_url']} label="Server URL">
              <Input style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name={['analytics', 'plausible', 'domain']} label="Domain">
              <Input style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name={['analytics', 'plausible', 'embed_code']} label="Embed Code">
              <Input.TextArea style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button disabled={!valueChange} type="primary" htmlType="submit">
            Update
          </Button>
        </Form.Item>
      </Form>
    </ConfigProvider>
  );
}

export default AnalyticsForm;
