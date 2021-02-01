import React from 'react';
import { Row, Col, Form, Input, Button, Space, Select, Drawer } from 'antd';
import Editor from '../../../components/Editor';
import Selector from '../../../components/Selector';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import { useSelector, useDispatch } from 'react-redux';
import Modal from 'antd/lib/modal/Modal';
import ClaimCreateForm from '../../claims/components/ClaimForm';
import { addClaim } from '../../../actions/claims';
import { addTemplate } from '../../../actions/posts';
import { useHistory } from 'react-router-dom';
import { SettingFilled } from '@ant-design/icons';
import { setCollapse, setExpand } from './../../../actions/sidebar';

function PostForm({ onCreate, data = {}, actions = {} }) {
  const history = useHistory();
  const [form] = Form.useForm();
  const sidebar = useSelector((state) => state.sidebar);
  const dispatch = useDispatch();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const prev = sidebar.collapsed;
    if (!sidebar.collapsed) {
      dispatch(setCollapse());
    }
    return () => (prev ? dispatch(setCollapse()) : dispatch(setExpand()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { Option } = Select;

  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const showDrawer = () => {
    setDrawerVisible(true);
  };
  const onClose = () => {
    setDrawerVisible(false);
  };
  const formats = useSelector((state) => state.formats.details);

  if (!data.status) data.status = 'draft';

  const [claimHide, setClaimHide] = React.useState(
    data.format && formats[data.format] && formats[data.format].slug === 'fact-check'
      ? false
      : true,
  );

  const onSave = (values) => {
    values.category_ids = values.categories || [];
    values.tag_ids = values.tags || [];
    values.format_id = values.format || 0;
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
    dispatch(addTemplate({ post_id: parseInt(data.id) })).then(() => history.push('/posts'));
  };

  return (
    <>
      <Modal visible={visible} onOk={handleOk} onCancel={handleCancel}>
        <ClaimCreateForm onCreate={onClaimCreate} width={560} />
      </Modal>
      <Form
        form={form}
        initialValues={{ ...data }}
        style={{ maxWidth: '100%', width: '100%' }}
        onFinish={(values) => onSave(values)}
        layout="vertical"
        onValuesChange={(changedValues, allValues) => {
          if (changedValues.format) {
            const flag =
              form.getFieldValue('format') &&
              formats[form.getFieldValue('format')] &&
              formats[form.getFieldValue('format')].slug === 'fact-check';

            setClaimHide(!flag);
          }
        }}
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
            <Col span={12} offset={6}>
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
                  style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center' }}
                />
              </Form.Item>
              <Form.Item name="description">
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
                <Form.Item
                  name="format"
                  label="Formats"
                  rules={[
                    {
                      required: true,
                      message: 'Please add format!',
                    },
                  ]}
                >
                  <Selector action="Formats" />
                </Form.Item>
                <Form.Item name="claims" label="Claims" hidden={claimHide} key={!visible}>
                  <Selector mode="multiple" display={'title'} action="Claims" />
                </Form.Item>
                <Form.Item hidden={claimHide}>
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

export default PostForm;
