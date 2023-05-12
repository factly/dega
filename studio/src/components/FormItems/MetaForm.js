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
        expandIcon={({ isActive }) => <Button>{isActive ? 'Collapse' : 'Expand'}</Button>}
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
      </Collapse>
      <Collapse
        expandIconPosition="right"
        expandIcon={({ isActive }) => <Button>{isActive ? 'Collapse' : 'Expand'}</Button>}
        style={{ width: '100%', ...style }}
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
        expandIcon={({ isActive }) => <Button>{isActive ? 'Collapse' : 'Expand'}</Button>}
        style={{ width: '100%', ...style }}
      >
        <Collapse.Panel header="Meta Fields">
          <Form.Item name="meta_fields">
            <MonacoEditor language="json" width="100%" />
          </Form.Item>
        </Collapse.Panel>
      </Collapse>
    </>
  );
};

export default MetaForm;
