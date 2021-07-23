import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Space,
  Drawer,
  DatePicker,
  Dropdown,
  Switch,
  Menu,
} from 'antd';
import Editor from '../../../components/Editor';
import Selector from '../../../components/Selector';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import { useDispatch, useSelector } from 'react-redux';
import { addTemplate } from '../../../actions/posts';
import { useHistory, Prompt } from 'react-router-dom';
import { SettingFilled, LeftOutlined } from '@ant-design/icons';
import { setCollapse } from './../../../actions/sidebar';
import moment from 'moment';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';

function PostForm({ onCreate, data = {}, actions = {}, format, page = false }) {
  const history = useHistory();
  const [form] = Form.useForm();
  const sidebar = useSelector((state) => state.sidebar);
  const [status, setStatus] = useState(data.status ? data.status : 'draft');
  const dispatch = useDispatch();
  const [valueChange, setValueChange] = React.useState(false);

  const [metaDrawer, setMetaDrawer] = React.useState(false);

  useEffect(() => {
    const prev = sidebar.collapsed;
    if (!sidebar.collapsed) {
      dispatch(setCollapse(true));
    }
    return () => {
      if (!prev) dispatch(setCollapse(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [codeDrawer, setCodeDrawerVisible] = useState(false);

  const showDrawer = () => {
    setDrawerVisible(true);
  };
  const onClose = () => {
    setDrawerVisible(false);
    setCodeDrawerVisible(false);
    setMetaDrawer(false);
  };

  if (!data.status) data.status = 'draft';

  const [shouldBlockNavigation, setShouldBlockNavigation] = useState(false);

  const getCurrentDate = () => {
    return moment(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ');
  };

  const onSave = (values) => {
    setShouldBlockNavigation(false);
    if (values.meta_fields) {
      values.meta_fields = getJsonValue(values.meta_fields);
    }
    values.category_ids = values.categories || [];
    values.tag_ids = values.tags || [];
    values.format_id = format.id;
    values.author_ids = values.authors || [];
    values.status = status;
    values.status === 'publish'
      ? (values.published_date = values.published_date
          ? moment(values.published_date).format('YYYY-MM-DDTHH:mm:ssZ')
          : getCurrentDate())
      : (values.published_date = null);
    onCreate(values);
  };

  const onTitleChange = (string) => {
    if (status !== 'publish') {
      form.setFieldsValue({
        slug: maker(string),
      });
    }
  };

  if (data && data.id) {
    data.published_date = data.published_date ? moment(data.published_date) : null;
    if (data.meta_fields && typeof data.meta_fields !== 'string') {
      data.meta_fields = JSON.stringify(data.meta_fields);
    }
  }

  const createTemplate = () => {
    dispatch(addTemplate({ post_id: parseInt(data.id) })).then(() => history.push('/posts'));
  };
  const setReadyFlag = () => {
    status === 'ready' ? setStatus('draft') : setStatus('ready');
  };
  const readyToPublish = (
    <Menu>
      <Menu.Item>
        Ready to Publish <Switch onChange={setReadyFlag} checked={status === 'ready'}></Switch>
      </Menu.Item>
    </Menu>
  );
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (shouldBlockNavigation) {
        window.onbeforeunload = () => true;
      } else {
        window.onbeforeunload = undefined;
      }
    };
    handleBeforeUnload();
    return () => {
      window.removeEventListener('onbeforeunload', handleBeforeUnload);
    };
  }, [shouldBlockNavigation]);

  return (
    <>
      <Prompt
        when={shouldBlockNavigation}
        message="You have unsaved changes, are you sure you want to leave?"
      />
      <Form
        form={form}
        initialValues={{ ...data }}
        style={{ maxWidth: '100%', width: '100%' }}
        onFinish={(values) => onSave(values)}
        onValuesChange={() => {
          setShouldBlockNavigation(true);
          setValueChange(true);
        }}
        layout="vertical"
      >
        <Space direction="vertical">
          <div style={{ float: 'right' }}>
            <Space direction="horizontal">
              {data.id ? (
                <Form.Item name="template">
                  <Button type="secondary" onClick={createTemplate}>
                    Create Template
                  </Button>
                </Form.Item>
              ) : null}
              <Form.Item name="draft">
                <Dropdown overlay={readyToPublish}>
                  <Button
                    disabled={!valueChange}
                    type="secondary"
                    htmlType="submit"
                    onClick={() => (status === 'ready' ? setStatus('ready') : setStatus('draft'))}
                  >
                    Save
                  </Button>
                </Dropdown>
              </Form.Item>
              {actions.includes('admin') || actions.includes('publish') ? (
                <Form.Item name="submit">
                  <Button type="secondary" htmlType="submit" onClick={() => setStatus('publish')}>
                    {data.id && status === 'publish' ? 'Update' : 'Publish'}
                  </Button>
                </Form.Item>
              ) : null}
              <Form.Item name="drawerOpen">
                <Button type="secondary" onClick={showDrawer}>
                  <SettingFilled />
                </Button>
              </Form.Item>
            </Space>
          </div>
          <Row gutter={16}>
            <Col xs={{ span: 24 }} xl={{ span: 18, offset: 3 }} xxl={{ span: 12, offset: 6 }}>
              <Form.Item
                name="title"
                rules={[
                  {
                    required: true,
                    message: 'Please input the title!',
                  },
                  { min: 3, message: 'Title must be minimum 3 characters.' },
                  { max: 150, message: 'Title must be maximum 150 characters.' },
                ]}
              >
                <Input.TextArea
                  bordered={false}
                  placeholder="Add title for the post"
                  onChange={(e) => onTitleChange(e.target.value)}
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    resize: 'none',
                  }}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                />
              </Form.Item>

              <Form.Item name="description" className="post-description">
                <Editor />
              </Form.Item>
              <Drawer
                title={<h4 style={{ fontWeight: 'bold' }}>Post Settings</h4>}
                placement="right"
                closable={true}
                onClose={onClose}
                visible={drawerVisible}
                getContainer={false}
                width={366}
                bodyStyle={{ paddingBottom: 40 }}
                headerStyle={{ fontWeight: 'bold' }}
              >
                <Form.Item name="featured_medium_id" label="Featured Image">
                  <MediaSelector />
                </Form.Item>
                <Form.Item
                  name="excerpt"
                  label="Excerpt"
                  rules={[
                    { min: 3, message: 'Title must be minimum 3 characters.' },
                    { max: 5000, message: 'Excerpt must be a maximum of 5000 characters.' },
                    {
                      message: 'Add Excerpt',
                    },
                  ]}
                >
                  <Input.TextArea rows={4} placeholder="Excerpt" style={{ fontSize: 'medium' }} />
                </Form.Item>
                <Form.Item
                  name="slug"
                  label="Slug"
                  rules={[
                    {
                      required: true,
                      message: 'Please input the slug!',
                    },
                    {
                      pattern: checker,
                      message: 'Please enter valid slug!',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item name="published_date" label="Published Date">
                  <DatePicker />
                </Form.Item>
                <Form.Item name="categories" label="Categories">
                  <Selector mode="multiple" action="Categories" createEntity="Category" />
                </Form.Item>

                <Form.Item name="tags" label="Tags">
                  <Selector mode="multiple" action="Tags" createEntity="Tag" />
                </Form.Item>
                <Form.Item name="authors" label="Authors">
                  <Selector mode="multiple" display={'email'} action="Authors" />
                </Form.Item>
                <Form.Item>
                  <Button style={{ width: '100%' }} onClick={() => setMetaDrawer(true)}>
                    Add Meta Data
                  </Button>
                </Form.Item>
                <Form.Item>
                  <Button style={{ width: '100%' }} onClick={() => setCodeDrawerVisible(true)}>
                    Code Injection
                  </Button>
                </Form.Item>
              </Drawer>
              <Drawer
                title={<h4 style={{ fontWeight: 'bold' }}>Post Meta data</h4>}
                placement="right"
                closable={true}
                onClose={onClose}
                visible={metaDrawer}
                getContainer={false}
                width={480}
                bodyStyle={{ paddingBottom: 40 }}
                headerStyle={{ fontWeight: 'bold' }}
              >
                <Form.Item style={{ marginLeft: '-20px' }}>
                  <Button type="text" onClick={() => setMetaDrawer(false)}>
                    <LeftOutlined />
                    Back
                  </Button>
                </Form.Item>
                <Form.Item name={['meta', 'title']} label="Meta Title">
                  <Input />
                </Form.Item>
                <Form.Item name={['meta', 'description']} label="Meta Description">
                  <Input.TextArea />
                </Form.Item>
                <Form.Item name={['meta', 'canonical_URL']} label="Canonical URL">
                  <Input />
                </Form.Item>
                <Form.Item name="meta_fields" label="Meta Fields">
                  <MonacoEditor language="json" />
                </Form.Item>
              </Drawer>
              <Drawer
                title={<h4 style={{ fontWeight: 'bold' }}>Code Injection</h4>}
                placement="right"
                closable={true}
                onClose={onClose}
                visible={codeDrawer}
                getContainer={false}
                width={710}
                bodyStyle={{ paddingBottom: 40 }}
                headerStyle={{ fontWeight: 'bold' }}
              >
                <Form.Item style={{ marginLeft: '-20px' }}>
                  <Button type="text" onClick={() => setCodeDrawerVisible(false)}>
                    <LeftOutlined />
                    Back
                  </Button>
                </Form.Item>
                <Form.Item name="header_code" label="Header Code">
                  <MonacoEditor language="html" width={650} />
                </Form.Item>
                <Form.Item name="footer_code" label="Footer Code">
                  <MonacoEditor language="html" width={650} />
                </Form.Item>
              </Drawer>
            </Col>
          </Row>
        </Space>
      </Form>
    </>
  );
}

export default PostForm;
