import React, { useState, useEffect, useRef } from 'react';
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
  Tag,
  Menu,
  Modal,
  Typography,
  Collapse,
  Divider,
  ConfigProvider,
} from 'antd';
import Selector from '../../../components/Selector';
import { maker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import { useDispatch } from 'react-redux';
import { addTemplate } from '../../../actions/posts';
import { useHistory, Prompt } from 'react-router-dom';
import {
  SettingFilled,
  LeftOutlined,
  DownOutlined,
  MenuUnfoldOutlined,
  CheckCircleOutlined,
  ExceptionOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  TagsOutlined,
  FileSearchOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import ThreeDotIcon from '../../../assets/ThreeDotIcon';
import dayjs from 'dayjs';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';
import { DescriptionInput, SlugInput } from '../../../components/FormItems';
import { formatDate } from '../../../utils/date';

function PostForm({ onCreate, data = {}, actions = {}, format, page = false }) {
  const history = useHistory();
  const formRef = useRef(null);
  const [form] = Form.useForm();
  const [status, setStatus] = useState(data.status ? data.status : 'draft');
  const dispatch = useDispatch();
  const [valueChange, setValueChange] = React.useState(false);
  const [metaDrawer, setMetaDrawer] = React.useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [codeDrawer, setCodeDrawerVisible] = useState(false);
  const [metaFieldsDrawer, setMetaFieldsDrawerVisible] = useState(false);
  const [seoDrawer, setSeoDrawerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

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

  const showDrawer = () => {
    setDrawerVisible(true);
  };
  const onClose = () => {
    setDrawerVisible(false);
    setCodeDrawerVisible(false);
    setMetaFieldsDrawerVisible(false);
    setSeoDrawerVisible(false);
  };

  if (!data.status) data.status = 'draft';

  const [shouldBlockNavigation, setShouldBlockNavigation] = useState(false);

  const getCurrentDate = () => {
    return dayjs(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ');
  };

  const onSave = (values) => {
    const finalData = { ...values };

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (!finalData.hasOwnProperty(key)) {
          finalData[key] = data[key];
        }
      }
    }

    setShouldBlockNavigation(false);
    if (finalData.meta_fields) {
      finalData.meta_fields = getJsonValue(finalData.meta_fields);
    }
    finalData.category_ids = finalData.categories || [];
    finalData.tag_ids = finalData.tags || [];
    finalData.format_id = format.id;
    finalData.author_ids = finalData.authors || [];
    finalData.status = status;
    finalData.status === 'publish'
      ? (finalData.published_date = finalData.published_date
          ? dayjs(finalData.published_date).format('YYYY-MM-DDTHH:mm:ssZ')
          : getCurrentDate())
      : (finalData.published_date = null);
    onCreate(finalData);
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

  const createTemplate = () => {
    dispatch(addTemplate({ post_id: parseInt(data.id) })).then(() => {
      page ? history.push('/pages') : history.push('/posts');
    });
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
  const formProps = {
    form: form,
    ref: formRef,
    initialValues: { ...data },
    style: { maxWidth: '100%', width: '100%' },
    onFinish: (values) => onSave(values),
    onValuesChange: () => {
      setShouldBlockNavigation(true);
      setValueChange(true);
    },
    layout: 'vertical',
  };

  const postActions = [
    {
      key: 'save',
      label: (
        <Button type="link" disabled={!valueChange}>
          Save Draft
        </Button>
      ),
      onClick: () => {
        setStatus('draft');
        form.submit();
      },
    },
    {
      key: 'publish',
      label: (
        <Button type="ready" disabled={!valueChange}>
          Ready to Publish
        </Button>
      ),
      onClick: () => {
        setStatus('ready');
        form.submit();
      },
    },
  ];

  return (
    <>
      <Prompt
        when={shouldBlockNavigation}
        message="You have unsaved changes, are you sure you want to leave?"
      />
      <Form
        form={form}
        ref={formRef}
        initialValues={{ ...data }}
        style={{ maxWidth: '100%', width: '100%' }}
        onFinish={(values) => onSave(values)}
        onValuesChange={() => {
          setShouldBlockNavigation(true);
          setValueChange(true);
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
              {actions.includes('admin') || actions.includes('publish') ? (
                <Form.Item name="actions">
                  <Dropdown.Button
                    type="primary"
                    onClick={() => {
                      setStatus('publish');
                      form.submit();
                    }}
                    menu={{ items: postActions }}
                    icon={<DownOutlined style={{ fontSize: '14px' }} />}
                  >
                    <span style={{ width: '100px' }}>
                      {data.id && status === 'publish' ? 'Update' : 'Publish'}
                    </span>
                  </Dropdown.Button>
                </Form.Item>
              ) : null}
              <Form.Item name="drawerOpen">
                <Button onClick={showDrawer} type="link">
                  <SettingFilled style={{ fontSize: '14px', color: '#000000E0' }} />
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
                  placeholder={`Add title for the ${page ? 'page' : 'post'}`}
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
              <DescriptionInput
                type="editor"
                formItemProps={{ className: 'post-description' }}
                initialValue={data.description_html}
                noLabel
              />
              <Drawer
                className="edit-drawer"
                title={
                  <>
                    {actions.includes('admin') || actions.includes('publish') ? (
                      <Form.Item name="actions" style={{ float: 'right', margin: 0 }}>
                        <Dropdown.Button
                          type="primary"
                          onClick={() => {
                            setStatus('publish');
                            form.submit();
                          }}
                          menu={{ items: postActions }}
                          icon={<DownOutlined style={{ fontSize: '12px' }} />}
                        >
                          <span style={{ width: '60px' }}>
                            {data.id && status === 'publish' ? 'Update' : 'Publish'}
                          </span>
                        </Dropdown.Button>
                      </Form.Item>
                    ) : null}
                  </>
                }
                placement="right"
                closable={true}
                onClose={onClose}
                visible={drawerVisible}
                //  //getContainer={false}
                width={isMobileScreen ? '80vw' : 480}
                bodyStyle={{ paddingBottom: 40 }}
                headerStyle={{ fontWeight: 'bold' }}
              >
                <Form
                  form={form}
                  ref={formRef}
                  className="edit-form"
                  initialValues={{ ...data }}
                  style={{ maxWidth: '100%', width: '100%' }}
                  onFinish={(values) => onSave(values)}
                  onValuesChange={() => {
                    setShouldBlockNavigation(true);
                    setValueChange(true);
                  }}
                  layout="vertical"
                >
                  <Collapse
                    ghost
                    bordered={false}
                    accordion={true}
                    defaultActiveKey={['1']}
                    expandIcon={({ isActive }) => (
                      <div className="collapse-icon-background">
                        <MenuUnfoldOutlined
                          style={{ fontSize: '14px', color: isActive ? '#3473ED' : '#000000E0' }}
                        />
                      </div>
                    )}
                  >
                    <Collapse.Panel header="Details" key="1">
                      <Row justify="space-between" style={{ margin: '16px 0', marginTop: 0 }}>
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
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item name="authors" label="Authors">
                        <Selector mode="multiple" display={'display_name'} action="Authors" />
                      </Form.Item>
                      <Form.Item name="featured_medium_id" label="Featured Image">
                        <MediaSelector />
                      </Form.Item>
                      <Form.Item
                        name="is_featured"
                        id="is_featured"
                        style={{ marginBottom: '8px' }}
                      >
                        <Switch defaultChecked onChange={() => console.log('checked')} />
                        <label htmlFor="is_featured"> Mark as Featured </label>
                      </Form.Item>
                      <Form.Item name="is_exclude_from_homepage" id="is_exclude_from_homepage">
                        <Switch defaultChecked onChange={() => console.log('checked')} />
                        <label htmlFor="is_exclude_from_homepage"> Exclude from Homepage </label>
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
                      <Form.Item name="subtitle" label="Subtitle">
                        <Input placeholder="Subtitle" style={{ fontSize: 'medium' }} />
                      </Form.Item>
                      <Form.Item
                        name="excerpt"
                        label="Excerpt"
                        rules={[
                          { max: 5000, message: 'Excerpt must be a maximum of 5000 characters.' },
                          {
                            message: 'Add Excerpt',
                          },
                        ]}
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Excerpt"
                          style={{ fontSize: 'medium' }}
                        />
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
                        <AppstoreOutlined
                          style={{ fontSize: '14px', color: isActive ? '#3473ED' : '#000000E0' }}
                        />
                      </div>
                    )}
                  >
                    <Collapse.Panel header="Categories" key="1">
                      <Form.Item name="categories" style={{ marginBottom: '8px' }}>
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
                        <TagsOutlined
                          style={{ fontSize: '14px', color: isActive ? '#3473ED' : '#000000E0' }}
                        />
                      </div>
                    )}
                  >
                    <Collapse.Panel header="Tags" key="1">
                      <Form.Item name="tags" style={{ marginBottom: '8px' }}>
                        <Selector mode="multiple" action="Tags" createEntity="Tag" />
                      </Form.Item>
                    </Collapse.Panel>
                  </Collapse>
                  <Divider style={{ margin: 0 }} />
                  <div
                    style={{ display: 'flex', gap: '10px', cursor: 'pointer', padding: '1rem 0' }}
                    onClick={() => setSeoDrawerVisible(true)}
                  >
                    <div className="collapse-icon-background">
                      <FileSearchOutlined
                        style={{ fontSize: '14px', color: seoDrawer ? '#3473ED' : '#000000E0' }}
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
                  <Divider style={{ margin: '0 10px' }} />
                  <Modal
                    title="View Schemas"
                    visible={isModalVisible}
                    onOk={handleSchemaModalOk}
                    onCancel={handleSchemaModalCancel}
                    // width='40vw'
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
                      <Button
                        href="https://search.google.com/test/rich-results"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Test in Google Rich Results Text
                      </Button>,
                    ]}
                  >
                    <div id="schemas-container">
                      {data.schemas &&
                        data.schemas.map((schema) => (
                          <Typography.Text key={schema} code>
                            {JSON.stringify(schema)}
                          </Typography.Text>
                        ))}
                    </div>
                  </Modal>
                </Form>
              </Drawer>
              <Drawer
                title={<h4 style={{ fontWeight: 'bold' }}>Code Injection</h4>}
                placement="right"
                closable={true}
                onClose={onClose}
                visible={codeDrawer}
                //getContainer={false}
                width={isMobileScreen ? '80vw' : 480}
                bodyStyle={{ paddingBottom: 40 }}
                headerStyle={{ fontWeight: 'bold' }}
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
                visible={metaFieldsDrawer}
                //getContainer={false}
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
              <Drawer
                title={<h4 style={{ fontWeight: 'bold' }}>Seo Data</h4>}
                placement="right"
                style={{ width: '100%' }}
                closable={true}
                onClose={() => setSeoDrawerVisible(false)}
                visible={seoDrawer}
                //    getContainer={()=>{console.log(formRef.current);if(formRef.current)return formRef.current;return false;}}
                width={isMobileScreen ? '80vw' : 480}
                bodyStyle={{ paddingBottom: 40 }}
                headerStyle={{ fontWeight: 'bold' }}
              >
                <Form {...formProps}>
                  <Form.Item style={{ marginLeft: '-20px' }}>
                    <Button type="text" onClick={() => setSeoDrawerVisible(false)}>
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
            </Col>
          </Row>
        </Space>
      </Form>
    </>
  );
}

export default PostForm;
