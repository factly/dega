import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Row,
  Col,
  Skeleton,
  Form,
  Input,
  Button,
  Space,
  Popconfirm,
  Collapse,
  ConfigProvider,
  Typography,
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { getMedium, updateMedium, deleteMedium } from '../../actions/media';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { ArrowLeftOutlined } from '@ant-design/icons';
import getUserPermission from '../../utils/getUserPermission';
import { useHistory } from 'react-router-dom';
import MonacoEditor from '../../components/MonacoEditor';
import getJsonValue from '../../utils/getJsonValue';
import { TitleInput } from '../../components/FormItems';
import { Helmet } from 'react-helmet';

function EditMedium() {
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);
  const [isMobileScreen, setIsMobileScreen] = React.useState(false);

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setIsMobileScreen(true);
      } else {
        setIsMobileScreen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const { id } = useParams();
  const history = useHistory();
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'media', action: 'get', spaces });
  const disabled = !(actions.includes('admin') || actions.includes('update'));
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

  if (loading) return <Skeleton />;

  if (!media) {
    return <RecordNotFound />;
  }

  if (media && media.meta_fields) {
    if (typeof media.meta_fields !== 'string') {
      media.meta_fields = JSON.stringify(media.meta_fields);
    }
  }

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
      <Helmet title={`${media?.name} - Edit Medium`} />
      <Form
        layout="vertical"
        form={form}
        name="create-space"
        className="edit-form"
        onFinish={(values) => {
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
          updateMedia(values);
        }}
        onValuesChange={() => {
          setValueChange(true);
        }}
        initialValues={media}
      >
        <Row gutter={[20, 20]} align="right">
          <Col
            span={'24'}
            style={{ display: 'flex', justifyContent: 'end'}}
          >
            <Form.Item>
              <Space>
                <Popconfirm
                  title="Are you sure you want to delete this?"
                  onConfirm={() => {
                    dispatch(deleteMedium(id)).then(() => history.push('/media'));
                  }}
                >
                  <Button
                    danger
                    disabled={disabled} // icon={<DeleteOutlined />}
                  >
                    Delete
                  </Button>
                </Popconfirm>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={disabled || !valueChange}
                //  icon={<SendOutlined />}
                >
                  Submit
                </Button>
              </Space>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Row gutter={40} style={{ padding: '0 1rem' }}>
              <Collapse
                defaultActiveKey={['1']}
                expandIconPosition="right"
                expandIcon={({ isActive }) => <Button>{isActive ? 'Collapse' : 'Expand'}</Button>}
                style={{ width: '100%', background: '#f0f2f5', border: 0 }}
              >
                <Collapse.Panel key="1" header="General">
                  <Row style={{ background: '#F9FAFB', marginBottom: '1rem', gap: '3rem' }}>
                    <Col xs={24} md={10}>
                      <TitleInput name="name" label="Name" inputProps={{ disabled }} />
                      <Form.Item name="alt_text" label="Alt Text">
                        <Input disabled={disabled} />
                      </Form.Item>
                      <Form.Item name="caption" label="Caption">
                        <Input disabled={disabled} />
                      </Form.Item>
                      <Form.Item name="description" label="Description">
                        <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} disabled={disabled} />
                      </Form.Item>
                      <Form.Item name="meta_fields" label="Metafields">
                        <MonacoEditor language="json" width="100%"/>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Typography.Text>Featured Image</Typography.Text>
                      <img
                        src={
                          // media.url?.[window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw']
                          'https://source.unsplash.com/random/?city,night'

                        }
                        alt={'space'}
                        style={{
                          maxHeight: '250px',
                          borderRadius: '8px',
                          display: 'block',
                          margin: '16px auto',
                          width: isMobileScreen ? '100%' : '305px',
                          height: '170px',
                        }}
                      />
                    </Col>
                  </Row>
                </Collapse.Panel>
              </Collapse>
            </Row>
          </Col>
        </Row>
      </Form>
    </ConfigProvider>
  );
}

export default EditMedium;
