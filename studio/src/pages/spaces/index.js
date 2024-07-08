import React from 'react';
import { Space, Button, Row, Col, ConfigProvider } from 'antd';
import { Link } from 'react-router-dom';
import SpaceList from './components/SpaceList';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';

function Spaces() {
  const { role } = useSelector((state) => {
    const { selected } = state.spaces;

    if (selected !== '') {
      const space = state.spaces.details[selected];
      const role = space.org_role;
      return {
        role: role,
      };
    }
    return { role: 'member' };
  });

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            controlHeight: 35,
            colorBorder: '#1890FF',
            colorPrimaryHover: '#00000026',
            colorText: '#1890FF',
            paddingXS: '2px, 16px, 2px, 16px',
          },
        },
      }}
    >
      <Space direction="vertical">
        <Helmet title={'Spaces'} />
        <Row gutter={16} justify="end">
          {role === 'admin' ? (
            <Col>
              <Link key="2" to="/settings/advanced/reindex">
                <Button>Reindex</Button>
              </Link>
            </Col>
          ) : null}
          <Link key="1" to="/spaces/create">
            <Button type="primary">New Space</Button>
          </Link>
        </Row>
        <SpaceList />
      </Space>
    </ConfigProvider>
  );
}

export default Spaces;
