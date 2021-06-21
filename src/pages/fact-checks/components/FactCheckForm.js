import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, Button, Space, Drawer, DatePicker, Dropdown, Menu, Switch } from 'antd';
import Editor from '../../../components/Editor';
import Selector from '../../../components/Selector';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'antd/lib/modal/Modal';
import ClaimCreateForm from '../../claims/components/ClaimForm';
import { addClaim, getClaims, updateClaim } from '../../../actions/claims';
import { addTemplate } from '../../../actions/posts';
import { Prompt, useHistory } from 'react-router-dom';
import { SettingFilled } from '@ant-design/icons';
import { setCollapse } from './../../../actions/sidebar';
import moment from 'moment';
import ClaimList from './ClaimList';
import DraggableClaimList from './DraggableClaimList';

function FactCheckForm({ onCreate, data = {}, actions = {}, format }) {
  const history = useHistory();
  const [form] = Form.useForm();
  const sidebar = useSelector((state) => state.sidebar);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState(data.status ? data.status : 'draft');
  const [claimCreatedFlag, setClaimCreatedFlag] = React.useState(false);
  const [newClaim, setNewClaim] = React.useState(null);
  const [valueChange, setValueChange] = useState(false);
  const [claimID, setClaimID] = useState(0);
  const { details, loading } = useSelector(({ claims: { details, loading } }) => ({
    details,
    loading,
  }));
  const [claimListChange, setClaimListChange] = React.useState(false);
  const [claimOrder, setClaimOrder] = useState(
    data.claimOrder ? data.claimOrder : data.claims && data.claims.length > 0 ? data.claims : [],
  );
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

  const { claims, claimLoading } = useSelector((state) => {
    return { claims: state.claims, claimLoading: state.claims.loading };
  });
  const updateClaims = (fetchedClaimId) => {
    const claimList = form.getFieldValue('claims');
    if (claimList.length === data.claims.length) {
      data.claims.push(fetchedClaimId);
    } else {
      form.setFieldsValue({
        claims: [...claimList, fetchedClaimId],
      });
      data.claims = form.getFieldValue('claims');
    }
    setClaimCreatedFlag(false);
  };
  if (!claimLoading && claimCreatedFlag) {
    const fetchedClaimId = claims.req[0].data[0];
    const fetchedClaim = claims.details[fetchedClaimId];
    if (newClaim.title === fetchedClaim.title) {
      updateClaims(fetchedClaimId); 
    }
  }

  const fetchAddedClaim = () => {
    dispatch(getClaims({}));
  };
  useEffect(() => {
    fetchAddedClaim();
  }, [newClaim]);

  useEffect(() => {}, [details, loading]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const showDrawer = () => {
    setDrawerVisible(true);
  };
  const onClose = () => {
    setDrawerVisible(false);
  };

  if (!data.status) data.status = 'draft';

  const [shouldBlockNavigation, setShouldBlockNavigation] = useState(false);

  const getCurrentDate = () => {
    return moment(Date.now()).format('YYYY-MM-DDTHH:mm:ssZ');
  };

  const onSave = (values) => {
    setShouldBlockNavigation(false);
    values.category_ids = values.categories || [];
    values.tag_ids = values.tags || [];
    values.format_id = format.id;
    values.author_ids = values.authors || [];
    values.claim_ids = values.claims || [];
    values.status = status;
    if (values.claim_ids.length > 0) {
      values.claimOrder = claimOrder;
    }
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
  }

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setVisible(false);
    setClaimID(0);
  };

  const handleCancel = () => {
    setVisible(false);
    setClaimID(0);
  };

  const onClaimCreate = (values) => {
    dispatch(addClaim(values)).then(() => {
      setVisible(false);
      setClaimCreatedFlag(true);
      setNewClaim(values);
      setClaimID(0);
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
        <Modal visible={visible} onOk={handleOk} onCancel={handleCancel} maskClosable={false}>
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
            setClaimListChange(true);
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
                  { min: 3, message: 'Title must be minimum 3 characters.' },
                  { max: 150, message: 'Title must be maximum 150 characters.' },
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
                  <DraggableClaimList
                    ids={form.getFieldValue('claims')}
                    setClaimID={setClaimID}
                    showModal={showModal}
                    details={details}
                    claimOrder={claimOrder}
                    setClaimOrder={setClaimOrder}
                    claimListChange={claimListChange}
                    setClaimListChange={setClaimListChange}
                  />
                </Form.Item>
              ) : null}

              {/* 
              {form.getFieldValue('claims') &&
              form.getFieldValue('claims').length > 0 &&
              !loading ? (
                <ClaimList
                  ids={form.getFieldValue('claims')}
                  setClaimID={setClaimID}
                  showModal={showModal}
                  details={details}
                />
              ) : null} */}

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
              </Drawer>
            </Col>
          </Row>
        </Space>
      </Form>
    </>
  );
}

export default FactCheckForm;
