import React from 'react';
import { Card, Avatar, Row, Col } from 'antd';
import {
  CompassTwoTone,
  FundTwoTone,
  TagsTwoTone,
  ApiTwoTone,
  DeploymentUnitOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const Website = () => {
  const { Meta } = Card;

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Link to={`/website/general`}>
            <Card hoverable>
              <Meta
                avatar={
                  <Avatar
                    icon={<DeploymentUnitOutlined />} //<SettingTwoTone twoToneColor="#ffb41f" />}
                    style={{ backgroundColor: 'transparent', color: '#ffb41f' }}
                  />
                }
                title="General"
                description="Basic Site Details and Site Meta Data"
              />
            </Card>
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`/website/branding`}>
            <Card hoverable>
              <Meta
                avatar={
                  <Avatar
                    icon={<TagsTwoTone twoToneColor="#51bbf6" />}
                    style={{ backgroundColor: 'transparent' }}
                  />
                }
                title="Branding"
                description="Update site logos, icons and design tokens"
              />
            </Card>
          </Link>
        </Col>
        <Col span={12}>
          <Link to="/website/menus">
            <Card hoverable>
              <Meta
                avatar={
                  <Avatar
                    icon={<CompassTwoTone twoToneColor="#7b2feb" />}
                    style={{ backgroundColor: 'transparent' }}
                  />
                }
                title="Navigation"
                description="Setup Menus"
              />
            </Card>
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`/website/code-injection`}>
            <Card hoverable>
              <Meta
                avatar={
                  <Avatar
                    icon={<ApiTwoTone twoToneColor="#30cf43" />}
                    style={{ backgroundColor: 'transparent' }}
                  />
                }
                title="Code Injection"
                description="Add code to your site"
              />
            </Card>
          </Link>
        </Col>
        <Col span={12}>
          <Link to={`/website/analytics`}>
            <Card hoverable>
              <Meta
                avatar={
                  <Avatar
                    icon={<FundTwoTone twoToneColor="#fb2d8d" />}
                    style={{ backgroundColor: 'transparent' }}
                  />
                }
                title="Analytics"
                description="View Analytics for your site"
              />
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
};

export default Website;
