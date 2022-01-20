import React from 'react';
import { Card, Avatar, Row, Col } from 'antd';
import { UserOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
const Members = () => {
  const { Meta } = Card;
  const gridStyle = {
    textAlign: 'left',
  };
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Helmet title={'Members'} />
        <Col span={12}>
          <Link to="/members/users">
            <Card style={gridStyle} hoverable>
              <Meta
                avatar={
                  <Avatar
                    icon={<UserOutlined twoToneColor="#ffb41f" />}
                    style={{ backgroundColor: 'transparent', color: '#ffb41f' }}
                  />
                }
                title="Users"
                description="View User Details"
              />
            </Card>
          </Link>
        </Col>
        <Col span={12}>
          <Link to="/members/policies">
            <Card style={gridStyle} hoverable>
              <Meta
                avatar={
                  <Avatar
                    icon={<EyeTwoTone twoToneColor="#51bbf6" />}
                    style={{ backgroundColor: 'transparent' }}
                  />
                }
                title="Policies"
                description="Update user policies"
              />
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
};

export default Members;
