import React from 'react';
import { Form, Button, Space } from 'antd';
import MenuField from './MenuField';
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
function Submenu({ fieldKey}) {
  return(
    <>
      <Form.List name={[fieldKey, "menu"]}>
        {(submenus, { add, remove }) => {
          return (
            <div>
              <div>
              <Form.Item>
                <Button onClick={() => {
                    add();
                  }} >
                 <PlusOutlined />  Add submenu
                </Button>
              </Form.Item>
              </div>
              {submenus.map((submenu, index2) => (
                <Space key={submenu.key}
                >
                <Form.Item>
                  <Space direction="horizontal">
                  <MenuField field={submenu} />
                  <MinusCircleOutlined  onClick={() => {
                    remove(submenu.name);
                  }} />
                  </Space>
                  <div style={{marginLeft:"25px"}} ><Submenu fieldKey={submenu.name}/></div>
                </Form.Item>
                </Space>
              ))}
            </div>
          )
        }}
      </Form.List>
    </>
  );
}

export default Submenu;