import React from 'react';
import { Form, Input, Button, Card, Modal } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ClipBoardCopy from '../../../utils/clipboardClick';
import { addSpaceToken } from '../../../actions/tokens';

const tailLayout = {
  wrapperCol: {
    offset: 8,
  },
};

const CreateSpaceTokenForm = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const navigate = useNavigate();
  const [token, setToken] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);

  const onReset = () => {
    form.resetFields();
  };

  const onCreate = (values) => {
    dispatch(addSpaceToken(values, setToken, setShowModal));
  };

  const handleOk = () => {
    navigate('/settings/advanced/tokens');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Card
        title={`Create Space Token`}
        style={{
          width: '50%',
          alignSelf: 'center',
        }}
      >
        <Form
          form={form}
          layout="vertical"
          name="create-application-token"
          onFinish={(values) => {
            onCreate(values);
            onReset();
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                required: true,
                message: 'Please enter the name!',
              },
              { min: 3, message: 'Name must be minimum 3 characters.' },
              { max: 50, message: 'Name must be maximum 50 characters.' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                required: true,
                message: 'Please input token description!',
              },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              Generate Token
            </Button>
          </Form.Item>
        </Form>
        <Modal
          title="Generated Token"
          open={showModal}
          width={650}
          closable={false}
          okText="Goto Tokens"
          onOk={handleOk}
          cancelButtonProps={{
            style: {
              display: 'none',
            },
          }}
        >
          <ClipBoardCopy text={showModal === true ? token : ''} />
        </Modal>
      </Card>
    </div>
  );
};

export default CreateSpaceTokenForm;
