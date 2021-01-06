import React from 'react';
import { Form, Input, Collapse } from 'antd';

function MenuItem ({ name, title, margin }) {
  const [form] = Form.useForm();
  const { Panel } = Collapse;
  const newMargin = parseInt(margin+20);
  const mar = newMargin+'px';
  return (
    <div style={{marginLeft : mar, width:'50%'}}>
      { 
      <Collapse>
        <Panel header={name}>
          <Form form={form} >
          <Form.Item name="name" label="Navigation Label" >
              <Input placeholder="Enter Label" defaultValue={name}/>
            </Form.Item>
            <Form.Item name="title" label="Title Attribute">
              <Input placeholder="Enter Title"  defaultValue={title} />
            </Form.Item>
            <Form.Item name="url" label="URL">
              <Input placeholder="Enter URL" />
            </Form.Item>
          </Form>
        </Panel>
    </Collapse> }
    </div>
  )
}
export default MenuItem;