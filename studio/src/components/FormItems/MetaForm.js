import React from 'react';
import { Collapse, Form, Button, Input } from 'antd';
import MonacoEditor from '../MonacoEditor/index';
import { useSelector } from 'react-redux';
import SocialCardPreview from '../PreviewSocialCard/index';

const MetaForm = ({ form, formData, style }) => {
  const siteAddress = useSelector(
    ({ spaces: { details, selected } }) => details[selected].site_address,
  );
  return (
    <>
      <Collapse
        expandIconPosition="right"
        expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
        style={{ width: '100%', ...style }}
      >
        <Collapse.Panel header="Meta Data">
          <Form.Item name={['meta', 'title']} label="Meta Title">
            <Input />
          </Form.Item>
          <Form.Item name={['meta', 'description']} label="Meta Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name={['meta', 'canonical_URL']} label="Canonical URL">
            <Input />
          </Form.Item>
        </Collapse.Panel>
        <Collapse.Panel header="Code Injection">
          <Form.Item name="header_code" label="Header Code">
            <MonacoEditor language="html" width="100%" />
          </Form.Item>
          <Form.Item name="footer_code" label="Footer Code">
            <MonacoEditor language="html" width="100%" />
          </Form.Item>
        </Collapse.Panel>
      </Collapse>
      <Collapse
        expandIconPosition="right"
        expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
        style={{ width: '100%', ...style }}
      >
        <Collapse.Panel header="Meta Fields">
          <Form.Item name="meta_fields">
            <MonacoEditor language="json" width="100%" />
          </Form.Item>
        </Collapse.Panel>
      </Collapse>

      {/* <Collapse
        expandIconPosition="right"
        expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
        style={{ width: '100%',...style }}
      >
        <Collapse.Panel header="Meta Data" className="meta-data-container">
          <div className="preview-form-container">
            <Form.Item name={['meta', 'title']} label="Meta Title">
              <Input
                defaultValue={form.getFieldValue(['meta', 'title']) || form.getFieldValue('name')}
              />
            </Form.Item>
            <Form.Item name={['meta', 'description']} label="Meta Description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name={['meta', 'canonical_URL']} label="Canonical URL">
              <Input
                addonBefore={siteAddress ? siteAddress + '/' : 'http://example.factly.in/'}
                defaultValue={
                  form.getFieldValue(['meta', 'canonical_URL']) || form.getFieldValue('slug') || ''
                }
                style={{ minWidth: '30ch' }}
              />
            </Form.Item>
          </div>
          <SocialCardPreview type="google" siteAddress={siteAddress} formData={formData} />
        </Collapse.Panel>
        <Collapse.Panel header="Twitter Card" className="meta-data-container">
          <div className="preview-form-container">
            {/* <Form.Item label="Twitter Image" name={'medium_id'}>
                    <MediaSelector
                      maxWidth={'350px'}
                      containerStyles={{ justifyContent: 'start' }}
                    />
                  </Form.Item> * /}
            <Form.Item name={['meta', 'twitter', 'title']} label="Meta Title">
              <Input
                defaultValue={
                  form.getFieldValue(['meta', 'twitter', 'title']) || form.getFieldValue('name')
                }
              />
            </Form.Item>
            <Form.Item name={['meta', 'twitter', 'description']} label="Meta Description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name={['meta', 'twitter', 'canonical_URL']} label="Canonical URL">
              <Input
                addonBefore={siteAddress ? siteAddress + '/' : 'http://example.factly.in/'}
                defaultValue={
                  form.getFieldValue(['meta', 'twitter', 'canonical_URL']) ||
                  form.getFieldValue('slug') ||
                  ''
                }
                style={{ minWidth: '30ch' }}
              />
            </Form.Item>
          </div>
          <SocialCardPreview
            type="twitter"
            formData={formData}
            siteAddress={siteAddress}
            image={form.getFieldValue('medium_id')}
          />
        </Collapse.Panel>
        <Collapse.Panel header="Facebook Card" className="meta-data-container">
          <div className="preview-form-container">
            {/* <Form.Item label="Facebook Image" name={'medium_id'}>
                    <MediaSelector
                      maxWidth={'350px'}
                      containerStyles={{ justifyContent: 'start' }}
                    />
                  </Form.Item> * /}
            <Form.Item name={['meta', 'facebook', 'title']} label="Meta Title">
              <Input
                defaultValue={
                  form.getFieldValue(['meta', 'facebook', 'title']) || form.getFieldValue('name')
                }
              />
            </Form.Item>
            <Form.Item name={['meta', 'facebook', 'description']} label="Meta Description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name={['meta', 'facebook', 'canonical_URL']} label="Canonical URL">
              <Input
                addonBefore={siteAddress ? siteAddress + '/' : 'http://example.factly.in/'}
                defaultValue={
                  form.getFieldValue(['meta', 'facebook', 'canonical_URL']) ||
                  form.getFieldValue('slug') ||
                  ''
                }
                style={{ minWidth: '30ch' }}
              />
            </Form.Item>
          </div>
          <SocialCardPreview
            type="fb"
            formData={formData}
            siteAddress={siteAddress}
            image={form.getFieldValue('medium_id')}
          />
        </Collapse.Panel>
      </Collapse>
      <Collapse
        expandIconPosition="right"
        expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
        style={{ width: '100%',...style }}
      >
        <Collapse.Panel header="Code Injection">
          <Form.Item name="header_code" label="Header Code">
            <MonacoEditor language="html" width="100%" />
          </Form.Item>
          <Form.Item name="footer_code" label="Footer Code">
            <MonacoEditor language="html" width="100%" />
          </Form.Item>
        </Collapse.Panel>
      </Collapse>
      <Collapse
        expandIconPosition="right"
        expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
        style={{ width: '100%' }}
      >
        <Collapse.Panel header="Meta Fields">
          <Form.Item name="meta_fields">
            <MonacoEditor language="json" width="100%" />
          </Form.Item>
        </Collapse.Panel>
      </Collapse> */}
    </>
  );
};

export default MetaForm;
