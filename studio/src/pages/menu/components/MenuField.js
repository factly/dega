import React, { useEffect } from 'react';
import { Form, Input, Collapse } from 'antd';

function MenuField({ field }) {
  const { Panel } = Collapse;
  const [panelHeader, setPanelHeader] = React.useState('Menu');
  const [inputRef, setInputRef] = React.useState(null);
  const handleInputChange = (e) => {
    var header = e.target.value;
    setPanelHeader(header);
  };
  useEffect(() => {
    if (inputRef) {
      setPanelHeader(inputRef.props.value);
    }
  }, [inputRef]);
  return (
    <Collapse
      style={{ maxWidth: '375px', background: '#f0f2f5', border: 0, marginLeft: '25px' }}
      defaultActiveKey={['1']}
    >
      <Panel header={panelHeader} key={['1']}>
        <Form.Item
          {...field}
          fieldKey={[field.fieldKey, 'name']}
          name={[field.name, 'name']}
          label="Navigation Label"
          rules={[
            {
              required: true,
              message: 'Please input the name!',
            },
          ]}
        >
          <Input
            ref={(input) => {
              if (input?.props) setInputRef(input);
            }}
            placeholder="Enter Label"
            onChange={(e) => handleInputChange(e)}
          />
        </Form.Item>
        <Form.Item
          {...field}
          fieldKey={[field.fieldKey, 'title']}
          name={[field.name, 'title']}
          label="Title Attribute"
        >
          <Input placeholder="Enter Title" />
        </Form.Item>
        <Form.Item
          {...field}
          fieldKey={[field.fieldKey, 'url']}
          name={[field.name, 'url']}
          label="URL"
        >
          <Input placeholder="Enter URL" />
        </Form.Item>
      </Panel>
    </Collapse>
  );
}

export default MenuField;
