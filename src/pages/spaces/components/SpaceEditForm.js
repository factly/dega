import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Form, Input, Steps, Select } from 'antd';
import MediaSelector from '../../../components/MediaSelector';
const { TextArea } = Input;
const { Option } = Select;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const SpaceCreateForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const {
    spaces: { orgs },
  } = useSelector((state) => state);

  const onReset = () => {
    form.resetFields();
  };

  const [current, setCurrent] = React.useState(0);
  const [icon, setIcon] = React.useState(null);
  return (
    <div>
      <Steps current={current} onChange={(value) => setCurrent(value)}>
        <Steps.Step title="Basic" />
        <Steps.Step title="Media" />
        <Steps.Step title="Contact" />
      </Steps>
      <Form
        {...layout}
        form={form}
        initialValues={data}
        name="create-space"
        onFinish={(values) => {
          onCreate(values);
          onReset();
        }}
        style={{
          paddingTop: '24px',
        }}
      >
        <div style={current === 0 ? { display: 'block' } : { display: 'none' }}>
          <Form.Item label="Name">
            <Input.Group compact>
              <Form.Item
                name="organisation_id"
                noStyle
                rules={[{ required: true, message: 'Organazation is required' }]}
              >
                <Select style={{ width: '40%' }} placeholder="Select organazation">
                  {orgs.map((org) => (
                    <Option key={org.id} value={org.id}>
                      {org.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="name"
                noStyle
                rules={[{ required: true, message: 'Name is required' }]}
              >
                <Input style={{ width: '60%' }} placeholder="Input name" />
              </Form.Item>
            </Input.Group>
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              {
                required: true,
                message: 'Please input the slug of space!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="site_title" label="Title">
            <Input />
          </Form.Item>
          <Form.Item name="tag_line" label="Tag line">
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea />
          </Form.Item>
          <Form.Item name="site_address" label="Website">
            <Input />
          </Form.Item>
        </div>
        <div style={current === 1 ? { display: 'block' } : { display: 'none' }}>
          <Button onClick={() => setIcon(true)}>Select</Button>
          {icon ? (
            <MediaSelector
              show={icon}
              handleCancel={() => setIcon(false)}
              handleSelect={() => console.log('OKAY')}
            />
          ) : null}
        </div>
        <div style={current === 2 ? { display: 'block' } : { display: 'none' }}>
          <Form.Item name={['social_media_urls', 'facebook']} label="Facebook">
            <Input style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name={['social_media_urls', 'twitetr']} label="Twitter">
            <Input style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name={['social_media_urls', 'pintrest']} label="Pintrest">
            <Input style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name={['social_media_urls', 'instagram']} label="Instagram">
            <Input style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </div>
        <Form.Item>
          <Button disabled={current === 0} onClick={() => setCurrent(current - 1)}>
            Back
          </Button>
          <Button disabled={current === 2} onClick={() => setCurrent(current + 1)}>
            Next
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SpaceCreateForm;
