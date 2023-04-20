import React from 'react';
import { Form, Button, Row, Col } from 'antd';
import MenuField from './MenuField';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
function Submenu({ fieldKey }) {
  return (
    <>
      <Form.List name={[fieldKey, 'menu']}>
        {(submenus, { add, remove }) => {
          return (
            <div>
              <Form.Item>
                <Button
                  style={{ marginTop: '10px' }}
                  onClick={() => {
                    add();
                  }}
                >
                  <PlusOutlined /> Add submenu
                </Button>
              </Form.Item>
              {submenus.map((field, index2) => (
                <Row key={field.key}>
                  <Col span={24}>
                    <Form.Item>
                      <Row key={index2} align="middle" gutter={16}>
                        <Col span={6}>
                          <MenuField field={field} />
                        </Col>
                        <Col span={6}>
                          <Button
                            onClick={() => {
                              remove(field.name);
                            }}
                          >
                            Remove menu
                          </Button>
                        </Col>
                      </Row>
                      <div style={{ marginLeft: '25px' }}>
                        <Submenu fieldKey={field.name} />
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              ))}
            </div>
          );
        }}
      </Form.List>
    </>
  );
}

export default Submenu;
