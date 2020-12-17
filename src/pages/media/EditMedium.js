import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, Result, Form, Input, Button, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { getMedium, updateMedium } from '../../actions/media';

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

function EditMedium() {
  const [form] = Form.useForm();

  const { id } = useParams();
  const dispatch = useDispatch();
  const { media, loading } = useSelector((state) => {
    return {
      media: state.media.details[id] ? state.media.details[id] : null,
      loading: state.media.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getMedium(id));
  }, [dispatch, id]);

  const updateMedia = (values) => {
    const data = {
      ...media,
      ...values,
    };
    dispatch(updateMedium(data));
  };

  if (loading && !media) {
    return ( 
      <Result 
        status="404"
        title="404"
        subTitle="Sorry, could not find what you are looking for."
      />
    );
  };

  return (
    <Row>
      <Col span={'12'}>
        <img src={media.url?.proxy} alt={'space'} style={{ width: '100%' }} />
      </Col>
      <Col span={'12'}>
        <Form
          {...layout}
          form={form}
          name="create-space"
          onFinish={(values) => {
            updateMedia(values);
          }}
          initialValues={media}
        >
          <Form.Item name="name" label="Name">
            <Input />
          </Form.Item>
          <Form.Item name="alt_text" label="Alt Text">
            <Input />
          </Form.Item>
          <Form.Item name="caption" label="Caption">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Space>
              <Link to="/media">
                <Button>Back</Button>
              </Link>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
}

export default EditMedium;
