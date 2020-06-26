import React from 'react';
import { Row, Col, Form, Input, Button } from 'antd';
import Selector from '../../components/Selector';
import Permission from '../../components/Permission';
import { addPolicy } from '../../actions/policies';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

function CreatePolicy() {
  const [form] = Form.useForm();
  const history = useHistory();

  const dispatch = useDispatch();

  const onCreate = (values) => {
    values.users = values.users.map((item) => item.toString());
    values.permissions = values.permissions.filter(
      (item) => item && item.resource && item.actions.length > 0,
    );
    dispatch(addPolicy(values)).then(() => history.push('/policies'));
  };

  return (
    <Form
      layout="vertical"
      form={form}
      name="create-policy"
      style={{ maxWidth: '100%', width: '100%' }}
      onFinish={(values) => onCreate(values)}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Introduction">
            <Input.TextArea />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="users" label="Users">
            <Selector mode="multiple" display={'email'} action="Authors" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name={['permissions', 0]} label="Categories">
        <Permission type="categories" />
      </Form.Item>
      <Form.Item name={['permissions', 1]} label="Tags">
        <Permission type="tags" />
      </Form.Item>
      <Form.Item name={['permissions', 3]} label="Formats">
        <Permission type="formats" />
      </Form.Item>
      <Form.Item name={['permissions', 4]} label="Media">
        <Permission type="media" />
      </Form.Item>
      <Form.Item name={['permissions', 5]} label="Posts">
        <Permission type="posts" />
      </Form.Item>
      <Form.Item name={['permissions', 6]} label="Claimants">
        <Permission type="claimants" />
      </Form.Item>
      <Form.Item name={['permissions', 7]} label="Ratings">
        <Permission type="ratings" />
      </Form.Item>
      <Form.Item name={['permissions', 8]} label="Claims">
        <Permission type="claims" />
      </Form.Item>
      <Form.Item name={['permissions', 9]} label="Fact Checks">
        <Permission type="factchecks" />
      </Form.Item>
      <Form.Item name={['permissions', 10]} label="Policies">
        <Permission type="policies" />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form>
  );
}

export default CreatePolicy;
