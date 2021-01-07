import React from 'react';
import { Form, Input, Collapse } from 'antd';

function MenuField({ field }) {
  const { Panel } = Collapse;
  const [panelHeader, setPanelHeader] = React.useState('Menu');
  const handleInputChange = (e) => {
    var header = e.target.value;
    setPanelHeader(header);
  }
  return (
    <Collapse>
      <Panel header={panelHeader} >
        <Form.Item {...field} fieldKey={[field.fieldKey, "name"]} name={[field.name, "name"]} label="Navigation Label"
          rules={[
            {
              required: true,
              message: 'Please input the name!',
            },
          ]}
        >
          <Input placeholder="Enter Label" onChange={(e) => handleInputChange(e)}/>
        </Form.Item>
        <Form.Item {...field} fieldKey={[field.fieldKey, "title"]} name={[field.name, "title"]} label="Title Attribute">
          <Input placeholder="Enter Title" />
        </Form.Item>
        <Form.Item  {...field} fieldKey={[field.fieldKey, "url"]} name={[field.name, "url"]} label="URL">
          <Input placeholder="Enter URL" />
        </Form.Item>
      </Panel>
    </Collapse>
  );
}

export default MenuField; 