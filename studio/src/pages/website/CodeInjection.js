import React, { useState } from 'react';
import { Button, Form, Skeleton, Row } from 'antd';
import MonacoEditor from '../../components/MonacoEditor/index';
import { useSelector, useDispatch } from 'react-redux';
import { updateSpace } from '../../actions/spaces';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';

function CodeInjection() {
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

  return (
    <div>
      <Helmet title={'Code Injection'} />
      <Form
        form={form}
        layout="vertical"
        initialValues={space}
        name="code-injection"
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
        <Form.Item name="header_code" label="Header Code">
          <MonacoEditor language="html" width="100%" />
        </Form.Item>
        <Form.Item name="footer_code" label="Footer Code">
          <MonacoEditor language="html" width="100%" />
        </Form.Item>
      </Form>
    </div>
  );
}

export default CodeInjection;
