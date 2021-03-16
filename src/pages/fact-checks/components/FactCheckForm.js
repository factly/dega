import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, Button, Space, Select, Drawer } from 'antd';
import Editor from '../../../components/Editor';
import Selector from '../../../components/Selector';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'antd/lib/modal/Modal';
import ClaimCreateForm from '../../claims/components/ClaimForm';
import { addClaim } from '../../../actions/claims';
import { addTemplate } from '../../../actions/posts';
import { Prompt, useHistory } from 'react-router-dom';
import { SettingFilled } from '@ant-design/icons';
import { setCollapse } from './../../../actions/sidebar';

function FactCheckForm({ onCreate, data = {}, actions = {}, format }) {
  const history = useHistory();
  const [form] = Form.useForm();
  const sidebar = useSelector((state) => state.sidebar);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);

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

  const { Option } = Select;

  const [drawerVisible, setDrawerVisible] = useState(false);
  const showDrawer = () => {
    setDrawerVisible(true);
  };
  const onClose = () => {
    setDrawerVisible(false);
  };

  if (!data.status) data.status = 'draft';

  const [shouldBlockNavigation, setShouldBlockNavigation] = useState(false);

  const onSave = (values) => {
    setShouldBlockNavigation(false);
    values.category_ids = values.categories || [];
    values.tag_ids = values.tags || [];
    values.format_id = format.id;
    values.author_ids = values.authors || [];
    values.claim_ids = values.claims || [];
    onCreate(values);
  };

  const onTitleChange = (string) => {
    if (form.getFieldValue('status') !== 'publish') {
      form.setFieldsValue({
        slug: maker(string),
      });
    }
  };
  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const onClaimCreate = (values) => {
    dispatch(addClaim(values)).then(() => setVisible(false));
  };

  const createTemplate = () => {
    dispatch(addTemplate({ post_id: parseInt(data.id) })).then(() => history.push('/fact-checks'));
  };

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
      <Modal visible={visible} onOk={handleOk} onCancel={handleCancel}>
        <ClaimCreateForm onCreate={onClaimCreate} width={560} />
      </Modal>
      <Form
        form={form}
        initialValues={{ ...data }}
        style={{ maxWidth: '100%', width: '100%' }}
        onFinish={(values) => onSave(values)}
        onValuesChange={() => setShouldBlockNavigation(true)}
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
              <Form.Item name="status">
                <Select>
                  <Option key={'draft'} value={'draft'}>
                    Draft
                  </Option>
                  {actions.includes('admin') || actions.includes('publish') ? (
                    <Option key={'publish'} value={'publish'}>
                      Publish
                    </Option>
                  ) : null}
                </Select>
              </Form.Item>
              <Form.Item name="submit">
                <Button type="secondary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
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
                  placeholder="Add title for the fact-check"
                  onChange={(e) => onTitleChange(e.target.value)}
                  style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center' }}
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
                headerStyle={{ fontWeight: 'bold' }}
              >
                <Form.Item name="featured_medium_id" label="Featured Image">
                  <MediaSelector />
                </Form.Item>
                <Form.Item name="claims" label="Claims" key={!visible}>
                  <Selector mode="multiple" display={'title'} action="Claims" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={showModal}>
                    Add Claim
                  </Button>
                </Form.Item>
                <Form.Item
                  name="excerpt"
                  label="Excerpt"
                  rules={[
                    { min: 3, message: 'Title must be minimum 3 characters.' },
                    { max: 5000, message: 'Excerpt must be a maximum of 5000 characters.' },
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
                <Form.Item name="categories" label="Categories">
                  <Selector mode="multiple" action="Categories" createEntity="Category" />
                </Form.Item>
                <Form.Item name="tags" label="Tags">
                  <Selector mode="multiple" action="Tags" createEntity="Tag" />
                </Form.Item>
                <Form.Item name="authors" label="Authors">
                  <Selector mode="multiple" display={'email'} action="Authors" />
                </Form.Item>
              </Drawer>
            </Col>
          </Row>
        </Space>
      </Form>
    </>
  );
}

export default FactCheckForm;
