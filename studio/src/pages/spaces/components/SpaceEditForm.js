import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Form, Input, Steps, Select, Collapse } from 'antd';
import MediaSelector from '../../../components/MediaSelector';
import { checker } from '../../../utils/sluger';
import MonacoEditor from '../../../components/MonacoEditor';
import getJsonValue from '../../../utils/getJsonValue';

const { Option } = Select;
const { TextArea } = Input;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 8,
  },
};

const SpaceEditForm = ({ onCreate, data = {} }) => {
  if (data && data.meta_fields) {
    if (typeof data.meta_fields !== 'string') {
      data.meta_fields = JSON.stringify(data.meta_fields);
    }
  }
  const [form] = Form.useForm();
  const orgs = useSelector((state) => state.spaces.orgs);
  const { Panel } = Collapse;

  const onReset = () => {
    form.resetFields();
  };

  const [valueChange, setValueChange] = React.useState(false);
  const [headerLang, setHeaderLang] = React.useState('html');
  const [footerLang, setFooterLang] = React.useState('html');
  const [basicPanel, setBasicPanel] = React.useState(null);

  const handleBasicCollapse = () => {
    basicPanel === null ? setBasicPanel('1') : setBasicPanel(null);
  };

  return (
    <div>
      <Form
        {...layout}
        form={form}
        initialValues={data}
        name="create-space"
        onFinish={(values) => {
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
          onCreate(values);
          onReset();
        }}
        scrollToFirstError={true}
        onFinishFailed={(errors) => {
          let name = errors.errorFields[0].name[0];
          if (['name', 'slug'].includes(name)) {
            setBasicPanel('1');
          }
        }}
        onValuesChange={() => {
          setValueChange(true);
        }}
        style={{
          paddingTop: '24px',
        }}
      >
        <Collapse
          style={{ width: '95%', marginBottom: '15px' }}
          activeKey={basicPanel}
          onChange={handleBasicCollapse}
        >
          <Panel header="Basic" key="1">
            <Form.Item label="Name">
              <Input.Group compact>
                <Form.Item
                  name="organisation_id"
                  noStyle
                  rules={[{ required: true, message: 'Organisation is required' }]}
                >
                  <Select style={{ width: '40%' }} placeholder="Select organisation">
                    {orgs.map((org) => (
                      <Option key={org.id} value={org.id}>
                        {org.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="name"
                  noStyle
                  rules={[
                    { required: true, message: 'Name is required' },
                    { min: 3, message: 'Name must be minimum 3 characters.' },
                    { max: 50, message: 'Name must be maximum 50 characters.' },
                  ]}
                >
                  <Input style={{ width: '60%' }} placeholder="Input name" />
                </Form.Item>
              </Input.Group>
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
                  required: checker,
                  message: 'Please enter valid slug!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="site_title" label="Title">
              <Input />
            </Form.Item>
            <Form.Item name="tag_line" label="Tag line">
              <Input />
            </Form.Item>
            <Form.Item name="site_address" label="Website">
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <TextArea placeholder="Enter Description..." />
            </Form.Item>
            <Form.Item name="meta_fields" label="Metafields">
              <MonacoEditor language="json" />
            </Form.Item>
          </Panel>
        </Collapse>
        <Collapse style={{ width: '95%', marginBottom: '15px' }}>
          <Panel header="Media" key="2">
            <Form.Item label="Logo" name="logo_id">
              <MediaSelector />
            </Form.Item>
            <Form.Item label="Logo Mobile" name="logo_mobile_id">
              <MediaSelector />
            </Form.Item>
            <Form.Item label="Fav Icon" name="fav_icon_id">
              <MediaSelector />
            </Form.Item>
            <Form.Item label="Mobile Icon" name="mobile_icon_id">
              <MediaSelector />
            </Form.Item>
          </Panel>
        </Collapse>
        <Collapse style={{ width: '95%', marginBottom: '15px' }}>
          <Panel header="Contact" key="3">
            <Form.Item name={['social_media_urls', 'facebook']} label="Facebook">
              <Input style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name={['social_media_urls', 'twitter']} label="Twitter">
              <Input style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name={['social_media_urls', 'pintrest']} label="Pintrest">
              <Input style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name={['social_media_urls', 'instagram']} label="Instagram">
              <Input style={{ width: '100%' }} />
            </Form.Item>
          </Panel>
        </Collapse>
        <Collapse style={{ width: '95%', marginBottom: '15px' }}>
          <Panel header="Analytics" key="4">
            <Form.Item name={['analytics', 'plausible', 'server_url']} label="Server URL">
              <Input style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name={['analytics', 'plausible', 'domain']} label="Domain">
              <Input style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name={['analytics', 'plausible', 'embed_code']} label="Embed Code">
              <Input.TextArea style={{ width: '100%' }} />
            </Form.Item>
          </Panel>
        </Collapse>
        <Collapse style={{ width: '95%', marginBottom: '15px' }}>
          <Panel header="Code Injection" key="5">
            <Form.Item label="Select language">
              <Select
                defaultValue="html"
                onChange={(value) => {
                  setHeaderLang(value);
                }}
              >
                <Option value="html">HTML</Option>
                <Option value="json">JSON</Option>
                <Option value="css">CSS</Option>
                <Option value="typescript">JavaScript</Option>
              </Select>
            </Form.Item>
            <Form.Item name="header_code" label="Header Code">
              <MonacoEditor language={headerLang} />
            </Form.Item>
            <Form.Item label="Select language">
              <Select
                defaultValue="html"
                onChange={(value) => {
                  setFooterLang(value);
                }}
              >
                <Option value="html">HTML</Option>
                <Option value="json">JSON</Option>
                <Option value="css">CSS</Option>
                <Option value="typescript">JavaScript</Option>
              </Select>
            </Form.Item>
            <Form.Item name="footer_code" label="Footer Code">
              <MonacoEditor language={footerLang} />
            </Form.Item>
          </Panel>
        </Collapse>
        <Form.Item>
          <Button disabled={!valueChange} type="primary" htmlType="submit">
            Update
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SpaceEditForm;
