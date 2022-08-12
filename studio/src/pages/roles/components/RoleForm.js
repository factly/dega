import React from 'react';
import { Button, Card, Form, Input, Skeleton } from 'antd';
import { SlugInput } from '../../../components/FormItems';
import { maker } from '../../../utils/sluger';

function RoleForm({ data = {}, onCreate }) {
  const [form] = Form.useForm();
  console.log(data);
  const { TextArea } = Input;
  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };
  return (
    <Card style={{ width: '50%' }}>
      <Form
        form={form}
        layout="vertical"
        name="update-space-role"
        onFinish={(values) => {
          console.log(values);
          onCreate(values);
          //  console.log(onCreate,"onCreate")
          //  console.log(onCreate,"function")
          // console.log(something,"something")
          // console.log("hello" )

          // onReset();
        }}
        initialValues={{
          name: data.name,
          slug: data.slug,
          description: data.description,
        }}
      >
        {/* <h3> Space : {space?.name}</h3> */}
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              message: 'Please input role name!',
            },
          ]}
        >
          <Input onChange={(e) => onTitleChange(e.target.value)} placeholder="enter the name" />
        </Form.Item>
        <SlugInput />
        <Form.Item name="description" label="Description">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block form="update-space-role">
            {data && data.id ? 'Update' : 'Submit'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default RoleForm;
