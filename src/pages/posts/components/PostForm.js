import React from 'react';
import { Row, Col, Form, Input, Button, Space, Select } from 'antd';
import Editor from '../../../components/Editor';
import Selector from '../../../components/Selector';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import { useSelector, useDispatch } from 'react-redux';
import Modal from 'antd/lib/modal/Modal';
import ClaimCreateForm from '../../claims/components/ClaimForm';
import { addClaim } from '../../../actions/claims';

function PostForm({ onCreate, data = {}, actions = {} }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;

  const [visible, setVisible] = React.useState(false);

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
    if(form.getFieldValue('status') !== 'publish') {
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
          <Form.Item name="status" style={{ float: 'right' }}>
            <Button type="secondary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
          <Row gutter={16}>
            <Col span={18}>
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
                  style={{ fontSize: 'large', fontWeight: 'bold' }}
                />
              </Form.Item>
              <Form.Item
                name="excerpt"
                rules={[
                  { min: 3, message: 'Title must be minimum 3 characters.' },
                  { max: 5000, message: 'Excerpt must be a maximum of 5000 characters.' },
                ]}
              >
                <Input.TextArea
                  bordered={false}
                  rows={4}
                  placeholder="Excerpt"
                  style={{ fontSize: 'medium' }}
                />
              </Form.Item>
              <Form.Item name="claims" label="Claims" hidden={claimHide} key={!visible}>
                <Selector mode="multiple" display={'title'} action="Claims" />
              </Form.Item>
              <Form.Item hidden={claimHide}>
                <Button type="primary" onClick={showModal}>
                  Add Claim
                </Button>
              </Form.Item>

              <Form.Item name="description">
                <Editor />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Status" name="status">
                <Select>
                  <Option key={'draft'} value={'draft'}>
                    Draft
                  </Option>
                  { (actions.includes('admin') || actions.includes('publish')) ?
                    <Option key={'publish'} value={'publish'}>
                      Publish
                    </Option>
                    : null
                  } 
                  {data.id ? (
                    <Option key={'template'} value={'template'}>
                      Template
                    </Option>
                  ) : null}
                </Select>
              </Form.Item>
              <Form.Item name="featured_medium_id" label="Featured Image">
                <MediaSelector />
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
              <Form.Item name="authors" label="Authors">
                <Selector mode="multiple" display={'email'} action="Authors" />
              </Form.Item>
            </Col>
          </Row>
        </Space>
      </Form>
    </>
  );
}

export default PostForm;
