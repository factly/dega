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
  Menu,
  Switch,
  Modal,
  Typography,
} from 'antd';
import Selector from '../../../components/Selector';
import { maker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import { useDispatch, useSelector } from 'react-redux';
import ClaimCreateForm from '../../claims/components/ClaimForm';
import { createClaim, updateClaim } from '../../../actions/claims';
import { addTemplate } from '../../../actions/posts';
import { Prompt, useHistory } from 'react-router-dom';
import { SettingFilled, LeftOutlined } from '@ant-design/icons';
import moment from 'moment';
import ClaimList from './ClaimList';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';
import { DescriptionInput, SlugInput } from '../../../components/FormItems';

function FactCheckForm({ onCreate, data = {}, actions = {}, format }) {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState(data.status ? data.status : 'draft');
  const [claimCreatedFlag, setClaimCreatedFlag] = React.useState(false);
  const [newClaim, setNewClaim] = React.useState(null);
  const [valueChange, setValueChange] = useState(false);
  const [metaDrawer, setMetaDrawer] = React.useState(false);
  const [codeDrawer, setCodeDrawerVisible] = useState(false);
  const [metaFieldsDrawer, setMetaFieldsDrawerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const showSchemaModal = () => {
    setIsModalVisible(true);
  };

  const handleSchemaModalOk = () => {
    setIsModalVisible(false);
  };

  const handleSchemaModalCancel = () => {
    setIsModalVisible(false);
  };

  const copySchema = (textToCopy) => {
    // navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
      // navigator clipboard api method'
      return navigator.clipboard.writeText(textToCopy);
    } else {
      // text area method
      let textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      // make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((res, rej) => {
        // here the magic happens
        document.execCommand('copy') ? res() : rej();
        textArea.remove();
      });
    }
  };

  const [claimID, setClaimID] = useState(0);
  const { details, loading } = useSelector(({ claims: { details, loading } }) => ({
    details,
    loading,
  }));
  const [claimOrder, setClaimOrder] = useState(
    data.claims && data.claims.length > 0 ? data.claim_order : [],
  );

  if (claimCreatedFlag) {
    if (data && data.id) {
      data.claims.push(newClaim.id);
    } else {
      const claimList = form.getFieldValue('claims') ? form.getFieldValue('claims') : [];
      form.setFieldsValue({
        claims: [...claimList, newClaim.id],
      });
    }
    setClaimCreatedFlag(false);
  }

  useEffect(() => {}, [details, loading]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const showDrawer = () => {
    setDrawerVisible(true);
  };
  const onClose = () => {
    setDrawerVisible(false);
    setMetaDrawer(false);
    setCodeDrawerVisible(false);
    setMetaFieldsDrawerVisible(false);
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
    values.claim_ids = values.claims ? claimOrder : [];
    values.claim_order = values.claim_ids;
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

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    setClaimID(0);
  };

  const onClaimCreate = (values) => {
    dispatch(createClaim(values)).then((claim) => {
      setVisible(false);
      setNewClaim(claim);
      setClaimID(0);
      setClaimCreatedFlag(true);
    });
  };
  const onClaimEdit = (values) => {
    dispatch(updateClaim({ ...details[claimID], ...values })).then(() => {
      setVisible(false);
      setClaimID(0);
    });
  };

  const createTemplate = () => {
    dispatch(addTemplate({ post_id: parseInt(data.id) })).then(() => history.push('/fact-checks'));
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
      {visible && (
        <Modal visible={visible} onCancel={handleCancel} maskClosable={false} footer={null}>
          <ClaimCreateForm
            data={details[claimID]}
            onCreate={claimID > 0 ? onClaimEdit : onClaimCreate}
            width={560}
          />
        </Modal>
      )}
      <Form
        form={form}
        initialValues={{ ...data }}
        style={{ maxWidth: '100%', width: '100%' }}
        onFinish={(values) => onSave(values)}
        onValuesChange={(changedValues) => {
          setShouldBlockNavigation(true);
          setValueChange(true);
          if (changedValues.claims) {
            if (claimOrder.length < changedValues.claims.length) {
              setClaimOrder(
                claimOrder.concat(changedValues.claims.filter((x) => !claimOrder.includes(x))),
              );
            } else setClaimOrder(claimOrder.filter((x) => changedValues.claims.includes(x)));
          }
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
                  { max: 500, message: 'Title must be maximum 500 characters.' },
                ]}
              >
                <Input.TextArea
                  bordered={false}
                  placeholder="Add title for the fact-check"
                  onChange={(e) => onTitleChange(e.target.value)}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center' }}
                />
              </Form.Item>
              {form.getFieldValue('claims') &&
              form.getFieldValue('claims').length > 0 &&
              !loading ? (
                <Form.Item name="claimOrder">
                  <ClaimList
                    ids={form.getFieldValue('claims')}
                    setClaimID={setClaimID}
                    showModal={showModal}
                    details={details}
                    claimOrder={claimOrder}
                    setClaimOrder={setClaimOrder}
                  />
                </Form.Item>
              ) : null}
              <DescriptionInput formItemProps={{ className: 'post-description' }} noLabel />
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
                  <Selector mode="multiple" display={'claim'} action="Claims" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={showModal}>
                    Add Claim
                  </Button>
                </Form.Item>
                <Form.Item
                  name="excerpt"
                  label="Excerpt"
                  rules={[{ max: 5000, message: 'Excerpt must be a maximum of 5000 characters.' }]}
                >
                  <Input.TextArea rows={4} placeholder="Excerpt" style={{ fontSize: 'medium' }} />
                </Form.Item>
                <Form.Item name="subtitle" label="Subtitle">
                  <Input placeholder="Subtitle" style={{ fontSize: 'medium' }} />
                </Form.Item>
                <SlugInput />
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
                  <Selector mode="multiple" display={'display_name'} action="Authors" />
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
                <Form.Item>
                  <Button onClick={() => showSchemaModal()} style={{ width: '100%' }}>
                    View Schemas
                  </Button>
                </Form.Item>
                <Form.Item>
                  <Button
                    style={{ width: '100%' }}
                    onClick={() => setMetaFieldsDrawerVisible(true)}
                  >
                    Add Meta Fields
                  </Button>
                </Form.Item>
                <Modal
                  title="View Schemas"
                  visible={isModalVisible}
                  onOk={handleSchemaModalOk}
                  onCancel={handleSchemaModalCancel}
                  footer={[
                    <Button
                      onClick={() => {
                        const copyText = data.schemas.map(
                          (schema) =>
                            `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
                        );
                        copySchema(copyText);
                      }}
                    >
                      Copy
                    </Button>,
                    <a
                      href="https://search.google.com/test/rich-results"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="ant-btn ant-btn-secondary"
                    >
                      Test in Google Rich Results Text
                    </a>,
                  ]}
                >
                  <div id="schema-container">
                    {data.schemas &&
                      data.schemas.map((schema) => (
                        <Typography.Text code>
                          {`<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
                        </Typography.Text>
                      ))}
                  </div>
                </Modal>
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
              <Drawer
                title={<h4 style={{ fontWeight: 'bold' }}>Meta Fields</h4>}
                placement="right"
                closable={true}
                onClose={onClose}
                visible={metaFieldsDrawer}
                getContainer={false}
                width={480}
                bodyStyle={{ paddingBottom: 40 }}
                headerStyle={{ fontWeight: 'bold' }}
              >
                <Form.Item style={{ marginLeft: '-20px' }}>
                  <Button type="text" onClick={() => setMetaFieldsDrawerVisible(false)}>
                    <LeftOutlined />
                    Back
                  </Button>
                </Form.Item>
                <Form.Item
                  name="meta_fields"
                  label="Meta Fields"
                  extra="add JSON if you have to pass any extra data"
                >
                  <MonacoEditor language="json" />
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
