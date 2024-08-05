import React from 'react';
import { Space, Button, Row, Col, ConfigProvider } from 'antd';

import { Link } from 'react-router-dom';
import SpaceList from './components/SpaceList';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { reindexSpace } from '../../actions/meiliReindex';

function Spaces() {
  const dispatch = useDispatch();
  const { role , selectedSpaceId} = useSelector((state) => {
    const { selected } = state.spaces;

    if (selected !== '') {
      const space = state.spaces.details[selected];
      const role = space.org_role;
      return {
        role: role,
        selectedSpaceId: selected,
      };
    }
    return { role: 'member', selectedSpaceId: null  };
  });
  const handleSpaceReindex = () => {
    if (selectedSpaceId) {
      dispatch(reindexSpace(selectedSpaceId));
    } else {
      console.error('No space selected for reindexing');
    }
  };

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
              <Button onClick={handleSpaceReindex}>Reindex</Button>
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
