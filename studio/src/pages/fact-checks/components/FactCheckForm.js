import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExceptionOutlined,
  FileSearchOutlined,
  LeftOutlined,
  MenuFoldOutlined,
  ProfileOutlined,
  SettingFilled,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Collapse,
  DatePicker,
  Divider,
  Drawer,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createClaim, updateClaim } from '../../../actions/claims';
import { addTemplate } from '../../../actions/posts';
import ThreeDotIcon from '../../../assets/ThreeDotIcon';
import { DescriptionInput, SlugInput } from '../../../components/FormItems';
import MediaSelector from '../../../components/MediaSelector';
import MonacoEditor from '../../../components/MonacoEditor';
import Selector from '../../../components/Selector';
import { extractClaimIdsAndOrder, hasClaims } from '../../../utils/claims';
import { formatDate, getDatefromStringWithoutDay } from '../../../utils/date';
import getJsonValue from '../../../utils/getJsonValue';
import { maker } from '../../../utils/sluger';
import useNavigation from '../../../utils/useNavigation';
import ClaimCreateForm from '../../claims/components/ClaimForm';
import ClaimList from './ClaimList';
import { addErrorNotification } from '../../../actions/notifications';

function FactCheckForm({ onCreate, data = {}, actions = {}, format }) {
  const history = useNavigation();
  const formRef = useRef(null);
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
  const [isMobileScreen, setIsMobileScreen] = useState(false);
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
    return dayjs(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ');
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
    // check for claims in the editor output
    if (hasClaims(values?.description?.json)) {
      const { claimIds, claimOrder } = extractClaimIdsAndOrder(values.description.json);
      values.claim_ids = claimIds;
      values.claim_order = claimOrder;
    }
    values.status = status;
    if ((status ==='publish' || status === 'future') && values.author_ids.length === 0) {
      dispatch(addErrorNotification('At least one author must be assigned before publishing.'));
      return;
    }
    if (status === 'future' ) {
      if (!values.published_date) {
      dispatch(addErrorNotification('Published date is required for future publishing.'));
      return;
    }}
    values.status === 'publish'
      ? (values.published_date = values.published_date
          ? dayjs(values.published_date).format('YYYY-MM-DDTHH:mm:ssZ')
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
    data.published_date = data.published_date ? dayjs(data.published_date) : null;
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
    dispatch(addTemplate({ post_id: parseInt(data.id) })).then(() => history('/fact-checks'));
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

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobileScreen(true);
      } else {
        setIsMobileScreen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formProps = {
    form: form,
    ref: formRef,
    initialValues: { ...data },
    style: { maxWidth: '100%', width: '100%' },
    onFinish: (values) => onSave(values),
    onValuesChange: (changedValues) => {
      setShouldBlockNavigation(true);
      setValueChange(true);
      if (changedValues.claims) {
        if (claimOrder.length < changedValues.claims.length) {
          setClaimOrder(
            claimOrder.concat(changedValues.claims.filter((x) => !claimOrder.includes(x))),
          );
        } else setClaimOrder(claimOrder.filter((x) => changedValues.claims.includes(x)));
      }
    },
    layout: 'vertical',
  };
  return (
    <>
      {/* <Prompt
        // need to fix this deprecated in react-router-dom v6
        when={shouldBlockNavigation}
        message="You have unsaved changes, are you sure you want to leave?"
      /> */}
      {visible && (
        <Modal open={visible} onCancel={handleCancel} maskClosable={false} footer={null}>
          <ClaimCreateForm
            data={details?.[claimID]}
            onCreate={claimID > 0 ? onClaimEdit : onClaimCreate}
            width={560}
          />
        </Modal>
      )}
      <Form
        form={form}
        ref={formRef}
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
        className="edit-form"
      >
        <Space direction="vertical">
          <div style={{ float: 'right' }}>
            <Space direction="horizontal">
              {data.id ? (
                <Form.Item name="template">
                  <Button onClick={createTemplate}>Create Template</Button>
                </Form.Item>
              ) : null}
              <Form.Item name="draft">
                <Dropdown overlay={readyToPublish}>
                  <Button
                    disabled={!valueChange}
                    htmlType="submit"
                    onClick={() => (status === 'ready' ? setStatus('ready') : setStatus('draft'))}
                  >
                    Save
                  </Button>
                </Dropdown>
              </Form.Item>
              {actions.includes('admin') || actions.includes('publish') ? (
                <Form.Item name="submit">
                  <Button htmlType="submit" onClick={() => setStatus('publish')}>
                    {data.id && status === 'publish' ? 'Update' : 'Publish'}
                  </Button>
                </Form.Item>
              ) : null}
              <Form.Item name="drawerOpen">
                <Button onClick={showDrawer}>
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
              {data?.updated_at ? (
                <p style={{ fontSize: '18px', color: '#595E60' }}>
                  Last updated on : {getDatefromStringWithoutDay(data.updated_at)}
                </p>
              ) : null}
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
              <DescriptionInput
                formItemProps={{ className: 'post-description' }}
                noLabel
                initialValue={data.description_html}
              />
              <Drawer
                className="edit-drawer"
                title={<h4 style={{ fontWeight: 'bold' }}>Post Settings</h4>}
                placement="right"
                closable={true}
                onClose={onClose}
                open={drawerVisible}
                width={isMobileScreen ? '80vw' : 480}
                headerStyle={{ fontWeight: 'bold' }}
              >
                <Form {...formProps}>
                  <Collapse
                    ghost
                    bordered={false}
                    accordion={true}
                    defaultActiveKey={['1']}
                    expandIcon={({ isActive }) => (
                      <div className="collapse-icon-background">
                        <MenuFoldOutlined
                          style={{ fontSize: '14px', color: isActive ? '#3473ED' : '#000000E0' }}
                        />
                      </div>
                    )}
                  >
                    <Collapse.Panel header="Details" key="1">
                      <Row justify="space-between" style={{ margin: '16px 0', marginTop: 0 }}>
                      {data?.created_at ? (
 <Col span={16}>
 <Typography.Text style={{ color: '#575757E0', fontSize: '14px' }}>
   <span style={{ color: '#000000E0', fontWeight: 400 }}>
   Created Date:{' '}
    </span>
      {formatDate(data.created_at)}
    </Typography.Text>
 </Col>
) : null}
                        {data?.updated_at ? (
                          <Col span={16}>
                            <Typography.Text style={{ color: '#575757E0', fontSize: '14px' }}>
                              <span style={{ color: '#000000E0', fontWeight: 400 }}>
                                Last updated:{' '}
                              </span>
                              {formatDate(data.updated_at)}
                            </Typography.Text>
                          </Col>
                        ) : null}
                        <Col span={6}>
                          {status === 'publish' ? (
                            <Tag icon={<CheckCircleOutlined />} color="green">
                              Published
                            </Tag>
                          ) : status === 'draft' ? (
                            <Tag color="red" icon={<ExceptionOutlined />}>
                              Draft
                            </Tag>
                          ) : status === 'ready' ? (
                            <Tag color="gold" icon={<ClockCircleOutlined />}>
                              Ready to Publish
                            </Tag>
                          ) : null}
                        </Col>
                      </Row>
                      <Form.Item name="published_date" label="Published Date">
                        <DatePicker />
                      </Form.Item>
                      <Form.Item name="authors" label="Authors">
                        <Selector mode="multiple" display={'display_name'} action="Authors" />
                      </Form.Item>
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
                    </Collapse.Panel>
                  </Collapse>
                  <Divider style={{ margin: 0 }} />
                  <Collapse
                    ghost
                    bordered={false}
                    accordion={true}
                    expandIcon={({ isActive }) => (
                      <div className="collapse-icon-background">
                        <ProfileOutlined
                          style={{ fontSize: '14px', color: isActive ? '#3473ED' : '#000000E0' }}
                        />
                      </div>
                    )}
                  >
                    <Collapse.Panel header="Other Details" key="1">
                      <Form.Item
                        name="excerpt"
                        label="Excerpt"
                        rules={[
                          { max: 5000, message: 'Excerpt must be a maximum of 5000 characters.' },
                        ]}
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Excerpt"
                          style={{ fontSize: 'medium' }}
                        />
                      </Form.Item>
                      <Form.Item name="subtitle" label="Subtitle">
                        <Input placeholder="Subtitle" style={{ fontSize: 'medium' }} />
                      </Form.Item>
                    </Collapse.Panel>
                  </Collapse>
                  <Divider style={{ margin: 0 }} />
                  <Collapse
                    ghost
                    bordered={false}
                    accordion={true}
                    expandIcon={({ isActive }) => (
                      <div className="collapse-icon-background">
                        <ProfileOutlined
                          style={{ fontSize: '14px', color: isActive ? '#3473ED' : '#000000E0' }}
                        />
                      </div>
                    )}
                  >
                    <Collapse.Panel header="Categories" key="1">
                      <Form.Item name="categories" label="Categories">
                        <Selector mode="multiple" action="Categories" createEntity="Category" />
                      </Form.Item>
                    </Collapse.Panel>
                  </Collapse>
                  <Divider style={{ margin: 0 }} />
                  <Collapse
                    ghost
                    bordered={false}
                    accordion={true}
                    expandIcon={({ isActive }) => (
                      <div className="collapse-icon-background">
                        <ProfileOutlined
                          style={{ fontSize: '14px', color: isActive ? '#3473ED' : '#000000E0' }}
                        />
                      </div>
                    )}
                  >
                    <Collapse.Panel header="Tags" key="1">
                      <Form.Item name="tags" label="Tags">
                        <Selector mode="multiple" action="Tags" createEntity="Tag" />
                      </Form.Item>
                    </Collapse.Panel>
                  </Collapse>
                  <Divider style={{ margin: 0 }} />
                  <div
                    style={{ display: 'flex', gap: '10px', cursor: 'pointer', padding: '1rem 0' }}
                    onClick={() => setMetaDrawer(true)}
                  >
                    <div className="collapse-icon-background">
                      <FileSearchOutlined
                        style={{ fontSize: '14px', color: metaDrawer ? '#3473ED' : '#000000E0' }}
                      />
                    </div>
                    <Typography.Text strong>SEO</Typography.Text>
                  </div>
                  <Divider style={{ margin: '0 10px' }} />
                  <Collapse
                    ghost
                    bordered={false}
                    accordion={true}
                    expandIcon={({ isActive }) => (
                      <div className="collapse-icon-background">
                        <ThreeDotIcon color={isActive ? '#3473ED' : '#000000E0'} />
                      </div>
                    )}
                  >
                    <Collapse.Panel header="Others" key="1">
                      <Form.Item>
                        <Button style={{ width: '100%' }} onClick={() => setMetaDrawer(true)}>
                          Add Meta Data
                        </Button>
                      </Form.Item>
                      <Form.Item>
                        <Button
                          style={{ width: '100%' }}
                          onClick={() => setCodeDrawerVisible(true)}
                        >
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
                    </Collapse.Panel>
                  </Collapse>
                  <Modal
                    title="View Schemas"
                    open={isModalVisible}
                    onOk={handleSchemaModalOk}
                    onCancel={handleSchemaModalCancel}
                    footer={[
                      <Button
                        onClick={() => {
                          const copyText = data.schemas.map(
                            (schema) =>
                              `<script type="application/ld+json">${JSON.stringify(
                                schema,
                              )}</script>`,
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
                            {`<script type="application/ld+json">${JSON.stringify(
                              schema,
                            )}</script>`}
                          </Typography.Text>
                        ))}
                    </div>
                  </Modal>
                </Form>
              </Drawer>
              <Drawer
                title={<h4 style={{ fontWeight: 'bold' }}>Post Meta data</h4>}
                placement="right"
                closable={true}
                onClose={onClose}
                open={metaDrawer}
                width={isMobileScreen ? '80vw' : 480}
                bodyStyle={{ paddingBottom: 40 }}
                headerStyle={{ fontWeight: 'bold' }}
              >
                <Form {...formProps}>
                  <Form.Item style={{ marginLeft: '-20px' }}>
                    <Button type="text" onClick={() => setMetaDrawer(false)}>
                      <LeftOutlined />
                      Back
                    </Button>
                  </Form.Item>
                  <SlugInput />
                  <Form.Item name={['meta', 'title']} label="Meta Title">
                    <Input />
                  </Form.Item>
                  <Form.Item name={['meta', 'description']} label="Meta Description">
                    <Input.TextArea />
                  </Form.Item>
                  <Form.Item name={['meta', 'canonical_URL']} label="Canonical URL">
                    <Input />
                  </Form.Item>
                </Form>
              </Drawer>
              <Drawer
                title={<h4 style={{ fontWeight: 'bold' }}>Code Injection</h4>}
                placement="right"
                closable={true}
                onClose={onClose}
                open={codeDrawer}
                bodyStyle={{ paddingBottom: 40 }}
                headerStyle={{ fontWeight: 'bold' }}
                width={isMobileScreen ? '80vw' : 480}
              >
                <Form {...formProps}>
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
                </Form>
              </Drawer>
              <Drawer
                title={<h4 style={{ fontWeight: 'bold' }}>Meta Fields</h4>}
                placement="right"
                closable={true}
                onClose={onClose}
                open={metaFieldsDrawer}
                width={isMobileScreen ? '80vw' : 480}
                bodyStyle={{ paddingBottom: 40 }}
                headerStyle={{ fontWeight: 'bold' }}
              >
                <Form {...formProps}>
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
                </Form>
              </Drawer>
            </Col>
          </Row>
        </Space>
      </Form>
    </>
  );
}

export default FactCheckForm;
